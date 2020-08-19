const fs = require('fs')
const inlineCss = require('inline-css')
const moment = require('moment')

module.exports = async (tweet, bg = 'default') => {
    moment.locale(tweet.data.lang);

    const author = tweet.includes.users.find(o => o.id === tweet.data.author_id)
    const text = tweet.data.text.replace(/ https?:\/\/t.co\/[a-zA-Z0-9]*$/, '')
    const created_at = moment(tweet.data.created_at)

    let taggedText = text   .replace(/(https?:\/\/)([^\s]+)/g, '<a href="$&">$2</a>')
                            .replace(/#([^\s]+)/g, '<a href="https://twitter.com/hashtag/$1?src=hashtag_click">#$1</a>')
                            .replace(/\n/g, '<br />')

    let main = fs.readFileSync('form/main.html', 'utf-8')
    const verified = fs.readFileSync('form/verified.html', 'utf-8')

    main = main.replace('%ARTICLE_BG_CLASS%', 'background-' + bg)
    main = main.replace('%PROFILE_IMAGE%', author.profile_image_url)
    main = main.replace('%NAME%', author.name)
    main = author.verified ? main.replace('%VERIFIED%', verified) : main.replace('%VERIFIED%', '')
    main = main.replace('%USER_NAME%', author.username.includes('@') ? author.username : '@' + author.username)
    main = main.replace('%TEXT%', taggedText)
    main = main.replace('%TIME%', created_at.format('LT'))
    main = main.replace('%DATE%', created_at.format('ll'))

    let html = await inlineCss(main, { applyStyleTags: true, url: '/' })

    let includes = []
    let include_form = fs.readFileSync('form/include.html', 'utf-8')

    if(tweet.data.referenced_tweets && tweet.data.referenced_tweets.length > 0) {
        const ref_tweet = tweet.includes.tweets.find(o => o.id === tweet.data.referenced_tweets[0].id)
        const ref_author = tweet.includes.users.find(o => o.id === ref_tweet.author_id)
        const ref_text = ref_tweet.text.replace(/ https?:\/\/t.co\/[a-zA-Z0-9]*$/, '')
        const ref_created_at = moment(ref_tweet.created_at)

        let taggedText = ref_text   .replace(/\n/g, '<br />')

        let include_ref = fs.readFileSync('form/include/tweet/tweet.html', 'utf-8')

        include_ref = include_ref.replace('%ARTICLE_BG_CLASS%', 'background-' + bg)
        include_ref = include_ref.replace('%PROFILE_IMAGE%', ref_author.profile_image_url)
        include_ref = include_ref.replace('%NAME%', ref_author.name)
        include_ref = ref_author.verified ? include_ref.replace('%VERIFIED%', verified) : include_ref.replace('%VERIFIED%', '')
        include_ref = include_ref.replace('%USER_NAME%', ref_author.username.includes('@') ? ref_author.username : '@' + ref_author.username)
        include_ref = include_ref.replace('%TEXT%', taggedText)
        include_ref = include_ref.replace('%DATE%', ref_created_at.format('ll'))

        const include_ref_formed =  include_form.replace('%INCLUDE%', include_ref)

        const html_include_ref = await inlineCss(include_ref_formed, { applyStyleTags: true, url: '/' })

        includes.push(html_include_ref)
    }

    const html_includes = includes.join('')

    html = html.replace('%INCLUDES%', html_includes)

    return html
}

// test code
(async () => {
    const json = {
        "data": {
            "conversation_id": "1295275527444393984",
            "source": "Twitter for iPhone",
            "id": "1295275527444393984",
            "lang": "ja",
            "public_metrics": {
                "retweet_count": 84,
                "reply_count": 42,
                "like_count": 656,
                "quote_count": 0
            },
            "created_at": "2020-08-17T08:25:25.000Z",
            "context_annotations": [
                {
                    "domain": {
                        "id": "46",
                        "name": "Brand Category",
                        "description": "Categories within Brand Verticals that narrow down the scope of Brands"
                    },
                    "entity": {
                        "id": "781974596752842752",
                        "name": "Services"
                    }
                },
                {
                    "domain": {
                        "id": "47",
                        "name": "Brand",
                        "description": "Brands and Companies"
                    },
                    "entity": {
                        "id": "10041893684",
                        "name": "Instagram"
                    }
                }
            ],
            "author_id": "2384778510",
            "entities": {
                "urls": [
                    {
                        "start": 23,
                        "end": 46,
                        "url": "https://t.co/zLpWCk9sQ5",
                        "expanded_url": "https://www.instagram.com/seriko_is_no.1/",
                        "display_url": "instagram.com/seriko_is_no.1/",
                        "images": [
                            {
                                "url": "https://pbs.twimg.com/news_img/1295584378630754305/t_qeMREh?format=jpg&name=orig",
                                "width": 150,
                                "height": 150
                            },
                            {
                                "url": "https://pbs.twimg.com/news_img/1295584378630754305/t_qeMREh?format=jpg&name=150x150",
                                "width": 150,
                                "height": 150
                            }
                        ],
                        "status": 200,
                        "title": "YU SERIZAWA (@seriko_is_no.1) • Instagram photos and videos",
                        "description": "45.9k Followers, 102 Following, 353 Posts - See Instagram photos and videos from YU SERIZAWA (@seriko_is_no.1)",
                        "unwound_url": "https://www.instagram.com/seriko_is_no.1/"
                    }
                ],
                "annotations": [
                    {
                        "start": 0,
                        "end": 3,
                        "probability": 0.6478,
                        "type": "Product",
                        "normalized_text": "インスタ"
                    }
                ]
            },
            "text": "インスタたくさん更新したよう！みよう！よう！ https://t.co/zLpWCk9sQ5",
            "possibly_sensitive": false
        },
        "includes": {
            "users": [
                {
                    "id": "2384778510",
                    "created_at": "2014-03-12T06:21:37.000Z",
                    "profile_image_url": "https://pbs.twimg.com/profile_images/1225743557283045377/t1nA9Rvy_normal.jpg",
                    "name": "芹澤優(i☆Ris)",
                    "protected": false,
                    "pinned_tweet_id": "1293472403025084417",
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
                        "followers_count": 122480,
                        "following_count": 812,
                        "tweet_count": 16758,
                        "listed_count": 3319
                    },
                    "location": "せりざわーるど",
                    "description": "声優/アイドル/i☆Ris(青)/【群れなせ！シートン学園】メイメイ/【SHOWBYROCK‼︎ ましゅまいれっしゅ‼︎】スモモネ/【プリチャン】赤城あんな/#セリコソロ #芹澤水産 インスタ→ https://t.co/KcvkRb7jRp 海産物が大好きぷり🐟",
                    "username": "iRis_s_yu",
                    "verified": true
                }
            ]
        }
    }

    console.log(await module.exports(json))
})()