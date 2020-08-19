const fs = require('fs')
const inlineCss = require('inline-css')
const moment = require('moment')
const sass = require('node-sass')
const minify = require('html-minifier').minify;

module.exports = async (tweet, bg = 'default') => {
    // Localization settings
    const lang = tweet.data.lang
    moment.locale(lang)
    const locale = JSON.parse(fs.readFileSync('lang.json', 'utf-8'))

    // Preparing the style sheet
    let style_form = fs.readFileSync('form/style.scss', 'utf-8')
    style_form = style_form.replace('\'%FONT%\'', locale[lang] ? locale[lang].font : locale.en.font)
    style_form = style_form.replace('%BG%', bg)
    const style = sass.renderSync({ data: style_form });

    // Loading constant data
    const verified = fs.readFileSync('form/verified.html', 'utf-8')

    // Arranging main tweet data
    const author = tweet.includes.users.find(o => o.id === tweet.data.author_id)
    const created_at = moment(tweet.data.created_at)
    const text = tweet.data.text.replace(/ https?:\/\/t.co\/[a-zA-Z0-9]*$/, '')
    const text_tagged = text    .replace(/(https?:\/\/)([^\s]+)/g, '<a href="$&">$2</a>')
                                .replace(/#([^\s]+)/g, '<a href="https://twitter.com/hashtag/$1?src=hashtag_click">#$1</a>')
                                .replace(/\n/g, '<br />')

    // Loading the main tweet form
    let main = fs.readFileSync('form/main.html', 'utf-8')

    // Filling data in the form
    main = main.replace('%PROFILE_IMAGE%', author.profile_image_url)
    main = main.replace('%NAME%', author.name)
    main = author.verified ? main.replace('%VERIFIED%', verified) : main.replace('%VERIFIED%', '')
    main = main.replace('%USER_NAME%', author.username.includes('@') ? author.username : '@' + author.username)
    main = main.replace('%TEXT%', text_tagged)
    main = main.replace('%TIME%', created_at.format(locale[lang] ? locale[lang].datetime.LT : 'LT'))
    main = main.replace('%DATE%', created_at.format(locale[lang] ? locale[lang].datetime.ll : 'll'))

    //
    let includes = []
    let include_form = fs.readFileSync('form/include.html', 'utf-8')

    // Check if image exists
    if(tweet.includes.media && tweet.includes.media[0].type === 'photo') {
        // Check number of images
        const img_cnt = tweet.includes.media.length

        // Loading the image form
        let include_img = fs.readFileSync(`form/include/media/image_${img_cnt}.html`, 'utf-8')

        // Filling data in the form
        for(let i = 1; i <= img_cnt; i++) {
            include_img = include_img.replace(`%IMAGE_URL_${img_cnt}%`, tweet.includes.media[i - 1].url)
        }

        const html_include_img =  include_form.replace('%INCLUDE%', include_img)
        includes.push(html_include_img)
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
        const ref_link = `https://twitter.com/${ref_author.username}/status/${ref_tweet.id}`;

        // Loading the reference tweet form
        let include_ref = fs.readFileSync('form/include/tweet/tweet.html', 'utf-8')

        // Filling data in the form
        include_ref = include_ref.replace('%REF_LINK%', ref_link)
        include_ref = include_ref.replace('%PROFILE_IMAGE%', ref_author.profile_image_url)
        include_ref = include_ref.replace('%NAME%', ref_author.name)
        include_ref = ref_author.verified ? include_ref.replace('%VERIFIED%', verified) : include_ref.replace('%VERIFIED%', '')
        include_ref = include_ref.replace('%USER_NAME%', ref_author.username.includes('@') ? ref_author.username : '@' + ref_author.username)
        include_ref = include_ref.replace('%TEXT%', ref_text_tagged)
        include_ref = include_ref.replace('%DATE%', ref_created_at.format(locale[lang] ? locale[lang].datetime.lmd : 'll'))
        if(ref_tweet.attachments) {
            if(ref_tweet.attachments.media_keys) {
                if(ref_tweet.attachments.media_keys.length > 1 || ref_tweet.attachments.media_keys[0].split('_')[0] === '3') {
                    include_ref = include_ref.replace('%ATTACHMENT%', locale[lang] ? locale[lang].include['image'] : locale.en.include['image'])
                } else if(ref_tweet.attachments.media_keys[0].split('_')[0] === '7') {
                    include_ref = include_ref.replace('%ATTACHMENT%', locale[lang] ? locale[lang].include['video'] : locale.en.include['video'])
                } else {
                    include_ref = include_ref.replace('%ATTACHMENT%', locale[lang] ? locale[lang].include['media'] : locale.en.include['media'])
                }
            } else if(ref_tweet.attachments.poll_ids) {
                include_ref = include_ref.replace('%ATTACHMENT%', locale[lang] ? locale[lang].include['poll'] : locale.en.include['poll'])
            }
        } else {
            include_ref = include_ref.replace('%ATTACHMENT%', '')
        }

        const html_include_ref =  include_form.replace('%INCLUDE%', include_ref)
        includes.push(html_include_ref)
    }

    const html_includes = includes.join('')
    main = main.replace('%INCLUDES%', html_includes)

    const html_inline_style = await inlineCss(main, { extraCss: style.css, url: '/' })
    const html = minify(html_inline_style);

    return html
}

// test code
(async () => {
    const json = {
        "data": {
            "source": "Twitter for iPhone",
            "possibly_sensitive": false,
            "lang": "ja",
            "created_at": "2020-08-15T11:35:55.000Z",
            "text": "衣装はこちら！\n投票は5分間です！\n投票結果は、配信でチェックしてね😆\n#セリコソロ https://t.co/JIO3VzZ2je https://t.co/L7GI2tNdhq",
            "referenced_tweets": [
                {
                    "type": "quoted",
                    "id": "1294598539436150793"
                }
            ],
            "id": "1294598694847647746",
            "entities": {
                "urls": [
                    {
                        "start": 43,
                        "end": 66,
                        "url": "https://t.co/JIO3VzZ2je",
                        "expanded_url": "https://twitter.com/iRis_s_yu/status/1294598539436150793",
                        "display_url": "twitter.com/iRis_s_yu/stat…"
                    },
                    {
                        "start": 67,
                        "end": 90,
                        "url": "https://t.co/L7GI2tNdhq",
                        "expanded_url": "https://twitter.com/iRis_s_yu/status/1294598694847647746/photo/1",
                        "display_url": "pic.twitter.com/L7GI2tNdhq"
                    }
                ],
                "hashtags": [
                    {
                        "start": 36,
                        "end": 42,
                        "tag": "セリコソロ"
                    }
                ]
            },
            "author_id": "2384778510",
            "conversation_id": "1294598694847647746",
            "public_metrics": {
                "retweet_count": 212,
                "reply_count": 1,
                "like_count": 817,
                "quote_count": 7
            },
            "attachments": {
                "media_keys": [
                    "3_1294598686761078785"
                ]
            }
        },
        "includes": {
            "media": [
                {
                    "url": "https://pbs.twimg.com/media/EfdWpYMU0AES-6L.jpg",
                    "type": "photo",
                    "height": 576,
                    "width": 1024,
                    "media_key": "3_1294598686761078785"
                }
            ],
            "users": [
                {
                    "profile_image_url": "https://pbs.twimg.com/profile_images/1225743557283045377/t1nA9Rvy_normal.jpg",
                    "location": "せりざわーるど",
                    "verified": true,
                    "name": "芹澤優(i☆Ris)",
                    "entities": {
                        "url": {
                            "urls": [
                                {
                                    "start": 0,
                                    "end": 23,
                                    "url": "https://t.co/wiJsk6Kibi",
                                    "expanded_url": "http://yu-serizawa.com/",
                                    "display_url": "yu-serizawa.com"
                                }
                            ]
                        },
                        "description": {
                            "urls": [
                                {
                                    "start": 98,
                                    "end": 121,
                                    "url": "https://t.co/KcvkRb7jRp",
                                    "expanded_url": "https://www.instagram.com/seriko_is_no.1/",
                                    "display_url": "instagram.com/seriko_is_no.1/"
                                }
                            ],
                            "hashtags": [
                                {
                                    "start": 79,
                                    "end": 85,
                                    "tag": "セリコソロ"
                                },
                                {
                                    "start": 86,
                                    "end": 91,
                                    "tag": "芹澤水産"
                                }
                            ]
                        }
                    },
                    "url": "https://t.co/wiJsk6Kibi",
                    "public_metrics": {
                        "followers_count": 122490,
                        "following_count": 812,
                        "tweet_count": 16759,
                        "listed_count": 3321
                    },
                    "pinned_tweet_id": "1293472403025084417",
                    "username": "iRis_s_yu",
                    "id": "2384778510",
                    "protected": false,
                    "created_at": "2014-03-12T06:21:37.000Z",
                    "description": "声優/アイドル/i☆Ris(青)/【群れなせ！シートン学園】メイメイ/【SHOWBYROCK‼︎ ましゅまいれっしゅ‼︎】スモモネ/【プリチャン】赤城あんな/#セリコソロ #芹澤水産 インスタ→ https://t.co/KcvkRb7jRp 海産物が大好きぷり🐟"
                }
            ],
            "tweets": [
                {
                    "source": "Twitter for iPhone",
                    "entities": {
                        "annotations": [
                            {
                                "start": 0,
                                "end": 26,
                                "probability": 0.2803,
                                "type": "Other",
                                "normalized_text": "Yu Serizawa Online Live ～神"
                            }
                        ]
                    },
                    "possibly_sensitive": false,
                    "lang": "ja",
                    "created_at": "2020-08-15T11:35:18.000Z",
                    "text": "Yu Serizawa Online Live \n～神×対応×サマーパーティ～\n2部公演衣装投票スタート！！",
                    "attachments": {
                        "poll_ids": [
                            "1294598538370768896"
                        ]
                    },
                    "id": "1294598539436150793",
                    "author_id": "2384778510",
                    "conversation_id": "1294598539436150793",
                    "public_metrics": {
                        "retweet_count": 154,
                        "reply_count": 0,
                        "like_count": 577,
                        "quote_count": 3
                    }
                }
            ]
        }
    }

    console.log(await module.exports(json))
})()