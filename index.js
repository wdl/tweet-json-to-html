const fs = require('fs')
const path = require('path')
const juice = require('juice')
const moment = require('moment')
const sass = require('sass')
const minify = require('html-minifier').minify

module.exports = async (tweet, bg = 'default') => {
    // Localization settings
    const lang = tweet.data.lang
    moment.locale(lang)
    const locales = JSON.parse(fs.readFileSync(path.join(__dirname, 'lang.json'), 'utf-8'))
    const locale = locales[lang] ? locales[lang] : locales.en

    // Preparing the style sheet
    let style_form = fs.readFileSync(path.join(__dirname, 'form', 'style.scss'), 'utf-8')
    style_form = style_form.replace('\'%FONT%\'', locale.font)
    style_form = style_form.replace('%BG%', bg)
    const style = sass.renderSync({ data: style_form })
    const css = style.css.toString('utf-8')

    // Loading constant data
    const verified = fs.readFileSync(path.join(__dirname, 'form', 'verified.html'), 'utf-8')
    const play = fs.readFileSync(path.join(__dirname, 'form', 'play.html'), 'utf-8')

    // Arranging main tweet data
    const author = tweet.includes.users.find(o => o.id === tweet.data.author_id)
    const created_at = moment(tweet.data.created_at)
    const text = tweet.data.text.replace(/ https?:\/\/t.co\/[a-zA-Z0-9]*$/, '')
    const text_tagged = text    .replace(/(https?:\/\/)([^\s]+)/g, '<a href="$&" target="_blank">$2</a>')
                                .replace(/(?<=\s)#([^\s]+)/g, '<a href="https://twitter.com/hashtag/$1?src=hashtag_click" target="_blank">#$1</a>')
                                .replace(/(?<=\s)@([^\s]+)/g, '<a href="https://twitter.com/$1" target="_blank">@$1</a>')
                                .replace(/\n/g, '<br />')
    const link = `https://twitter.com/${author.username}/status/${tweet.data.id}`
    const author_link = `https://twitter.com/${author.username}`

    // Loading the main tweet form
    let main = fs.readFileSync(path.join(__dirname, 'form', 'main.html'), 'utf-8')

    // Filling data in the form
    main = main.replace('%AUTHOR_LINK%', author_link)
    main = main.replace('%PROFILE_IMAGE%', author.profile_image_url)
    main = main.replace('%NAME%', author.name)
    main = author.verified ? main.replace('%VERIFIED%', verified) : main.replace('%VERIFIED%', '')
    main = main.replace('%USER_NAME%', '@' + author.username)
    main = main.replace('%TEXT%', text_tagged)
    main = main.replace('%TIME%', created_at.format(locale.datetime.LT))
    main = main.replace('%DATE%', created_at.format(locale.datetime.ll))
    main = main.replace('%SOURCE%', tweet.data.source)

    //
    let includes = []
    let include_form = fs.readFileSync(path.join(__dirname, 'form', 'include.html'), 'utf-8')

    // Check if image exists
    if(tweet.includes.media && tweet.includes.media[0].type === 'photo') {
        // Check number of images
        const img_cnt = tweet.includes.media.length

        // Loading the image form
        let include_img = fs.readFileSync(path.join(__dirname, 'form', 'include', 'media', `image_${img_cnt}.html`), 'utf-8')

        // Filling data in the form
        include_img = include_img.replace('%LINK%', link)
        for(let i = 1; i <= img_cnt; i++) {
            include_img = include_img.replace(`%IMAGE_URL_${i}%`, tweet.includes.media[i - 1].url)
        }

        const html_include_img =  include_form.replace('%INCLUDE%', include_img)
        includes.push(html_include_img)
    }

    // Check if video exists
    if(tweet.includes.media && tweet.includes.media[0].type === 'video') {
        // Loading the video form
        let include_video = fs.readFileSync(path.join(__dirname, 'form', 'include', 'media', 'video.html'), 'utf-8')

        // Filling data in the form
        include_video = include_video.replace('%LINK%', link)
        include_video = include_video.replace(`%PREVIEW_IMAGE_URL%`, tweet.includes.media[0].preview_image_url)
        include_video = include_video.replace('%PLAY%', play)

        const html_include_video =  include_form.replace('%INCLUDE%', include_video)
        includes.push(html_include_video)
    }

    // Check if poll exists
    if(tweet.includes.polls) {
        // Check status of poll
        const poll_status = tweet.includes.polls[0].voting_status

        // Loading the poll form
        let include_poll = fs.readFileSync(path.join(__dirname, 'form', 'include', 'poll', `poll_${poll_status}.html`), 'utf-8')
        const include_poll_option = fs.readFileSync(path.join(__dirname, 'form', 'include', 'poll', `poll_${poll_status}_option.html`), 'utf-8')

        // Arranging poll data
        const option_cnt = tweet.includes.polls[0].options.length
        const votes_all = tweet.includes.polls[0].options.reduce((a, c) => { return a + c.votes }, 0)
        const votes_max = tweet.includes.polls[0].options.reduce((a, c) => { return c.votes > a ? c.votes : a }, 0)

        // Filling data in the form
        let include_poll_options = []
        for(let i = 1; i <= option_cnt; i++) {
            const this_option = tweet.includes.polls[0].options[i - 1]
            const this_option_percent = `${Math.round(this_option.votes / votes_all * 1000) / 10}%`

            let include_poll_this_option = include_poll_option
            include_poll_this_option = include_poll_this_option.replace(/\%LINK\%/g, link)
            include_poll_this_option = include_poll_this_option.replace(`%IS_TOP_OPTION%`, this_option.votes === votes_max ? 'top' : '')
            include_poll_this_option = include_poll_this_option.replace(`%POLL_OPTION_LABEL%`, this_option.label)
            include_poll_this_option = include_poll_this_option.replace(`%POLL_OPTION_PERCENT%`, this_option_percent)
            include_poll_this_option = include_poll_this_option.replace(`'%POLL_OPTION_BG_WIDTH%'`, this_option_percent)

            include_poll_options.push(include_poll_this_option)
        }
        include_poll = include_poll.replace('%POLL_OPTIONS%', include_poll_options.join(''))
        include_poll = include_poll.replace('%VOTES_ALL%', locale.poll.unit.replace('%NUM%', votes_all))
        include_poll = include_poll.replace('%POLL_CLOSED%', locale.poll.closed)

        includes.push(include_poll)
    }

    // Check if reference tweet exist
    if(tweet.data.referenced_tweets && tweet.data.referenced_tweets.length > 0) {
        // Get reference tweet data
        const ref_tweet = tweet.includes.tweets.find(o => o.id === tweet.data.referenced_tweets[0].id)

        // Arranging reference tweet data
        const ref_author = tweet.includes.users.find(o => o.id === ref_tweet.author_id)
        const ref_created_at = moment(ref_tweet.created_at)
        const ref_text = ref_tweet.text.replace(/ https?:\/\/t.co\/[a-zA-Z0-9]*$/, '')
        const ref_text_tagged = ref_text   .replace(/\n/g, '<br />')
        const ref_link = `https://twitter.com/${ref_author.username}/status/${ref_tweet.id}`

        // Loading the reference tweet form
        let include_ref = fs.readFileSync(path.join(__dirname, 'form', 'include', 'tweet', 'tweet.html'), 'utf-8')

        // Filling data in the form
        include_ref = include_ref.replace('%REF_LINK%', ref_link)
        include_ref = include_ref.replace('%PROFILE_IMAGE%', ref_author.profile_image_url)
        include_ref = include_ref.replace('%NAME%', ref_author.name)
        include_ref = ref_author.verified ? include_ref.replace('%VERIFIED%', verified) : include_ref.replace('%VERIFIED%', '')
        include_ref = include_ref.replace('%USER_NAME%', ref_author.username.includes('@') ? ref_author.username : '@' + ref_author.username)
        include_ref = include_ref.replace('%TEXT%', ref_text_tagged)
        include_ref = include_ref.replace('%DATE%', ref_created_at.format(locale.datetime.lmd))
        if(ref_tweet.attachments) {
            if(ref_tweet.attachments.media_keys) {
                if(ref_tweet.attachments.media_keys.length > 1 || ref_tweet.attachments.media_keys[0].split('_')[0] === '3') {
                    include_ref = include_ref.replace('%ATTACHMENT%', locale.include['image'])
                } else if(ref_tweet.attachments.media_keys[0].split('_')[0] === '7') {
                    include_ref = include_ref.replace('%ATTACHMENT%', locale.include['video'])
                } else {
                    include_ref = include_ref.replace('%ATTACHMENT%', locale.include['media'])
                }
            } else if(ref_tweet.attachments.poll_ids) {
                include_ref = include_ref.replace('%ATTACHMENT%', locale.include['poll'])
            }
        } else {
            include_ref = include_ref.replace('%ATTACHMENT%', '')
        }

        const html_include_ref =  include_form.replace('%INCLUDE%', include_ref)
        includes.push(html_include_ref)
    }

    const html_includes = includes.join('')
    main = main.replace('%INCLUDES%', html_includes)

    const html_inline_style = juice(`<style>${css}</style>` + main)
    const html = minify(html_inline_style, {
        collapseWhitespace: true,
        decodeEntities: true,
        minifyCSS: true,
        processConditionalComments: true,
        removeAttributeQuotes: true,
        sortAttributes: true
    })

    return html
}