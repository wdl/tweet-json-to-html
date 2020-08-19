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

    main = main.replace('%ARTICLE_BG_CLASS%', 'background-' + bg)
    main = main.replace('%PROFILE_IMAGE%', author.profile_image_url)
    main = main.replace('%NAME%', author.name)
    if(!author.verified) { main = main.replace(/<div class="verified".*?<\/div>/s, '') }
    main = main.replace('%USER_NAME%', author.username.includes('@') ? author.username : '@' + author.username)
    main = main.replace('%TEXT%', taggedText)
    main = main.replace('%TIME%', created_at.format('LT'))
    main = main.replace('%DATE%', created_at.format('ll'))

    const html = await inlineCss(main, { applyStyleTags: true, url: '/' })

    return html
}

// test code
(async () => {
    const json = {
        "data": {
            "source": "Twitter Web App",
            "public_metrics": {
                "retweet_count": 33,
                "reply_count": 1,
                "like_count": 185,
                "quote_count": 0
            },
            "text": "i☆Ris　芹澤優のせりざわーるどwith you。\n\nきょうの2曲目です。\nREIJINGSIGNALで『SSG』\n\nhttps://t.co/45K5NAkzwS\n\n#irisyou  #セリコソロ #i_Ris  #芹澤優 #芹澤優すきぴ\n#いま聴いてほしいラジオ",
            "entities": {
                "hashtags": [
                    {
                        "start": 85,
                        "end": 93,
                        "tag": "irisyou"
                    },
                    {
                        "start": 95,
                        "end": 101,
                        "tag": "セリコソロ"
                    },
                    {
                        "start": 102,
                        "end": 108,
                        "tag": "i_Ris"
                    },
                    {
                        "start": 110,
                        "end": 114,
                        "tag": "芹澤優"
                    },
                    {
                        "start": 115,
                        "end": 122,
                        "tag": "芹澤優すきぴ"
                    },
                    {
                        "start": 123,
                        "end": 135,
                        "tag": "いま聴いてほしいラジオ"
                    }
                ],
                "urls": [
                    {
                        "start": 60,
                        "end": 83,
                        "url": "https://t.co/45K5NAkzwS",
                        "expanded_url": "http://radiko.jp/share/?t=20200727230000&sid=JORF",
                        "display_url": "radiko.jp/share/?t=20200…",
                        "images": [
                            {
                                "url": "https://pbs.twimg.com/news_img/1290292314737278977/Z735Ih3i?format=png&name=orig",
                                "width": 480,
                                "height": 300
                            },
                            {
                                "url": "https://pbs.twimg.com/news_img/1290292314737278977/Z735Ih3i?format=png&name=150x150",
                                "width": 150,
                                "height": 150
                            }
                        ],
                        "status": 200,
                        "title": "i☆Ris芹澤優のせりざわーるど with you | ラジオ日本 | 2020/07/27/月 23:00-23:30",
                        "description": "▽アニソン・ヴォーカル・アイドルユニット i☆Risの芹澤優がこの時間にしてはテンション高めに、賑やかにお送りする30分間。メール：irisyou@jorf.co.jp番組公式twitterアカウント：",
                        "unwound_url": "http://radiko.jp/share/?t=20200727230000&sid=JORF"
                    }
                ],
                "annotations": [
                    {
                        "start": 0,
                        "end": 24,
                        "probability": 0.0997,
                        "type": "Other",
                        "normalized_text": "i☆Ris　芹澤優のせりざわーるどwith you"
                    }
                ]
            },
            "created_at": "2020-08-03T14:23:53.000Z",
            "possibly_sensitive": false,
            "author_id": "1542447492",
            "id": "1290292308106047494",
            "conversation_id": "1290292308106047494",
            "lang": "ja"
        },
        "includes": {
            "users": [
                {
                    "description": "i☆Ris芹澤優のレギュラーラジオ番組。\nラジオ日本NEXT月曜日23時00分〜23時30分！\nhttps://t.co/lZ6LSlltxLでもお楽しみいただけます。 #irisyou",
                    "protected": false,
                    "verified": false,
                    "entities": {
                        "url": {
                            "urls": [
                                {
                                    "start": 0,
                                    "end": 23,
                                    "url": "https://t.co/xlL8hB9Uji",
                                    "expanded_url": "http://www.jorf.co.jp/?program=irisyou",
                                    "display_url": "jorf.co.jp/?program=irisy…"
                                }
                            ]
                        },
                        "description": {
                            "urls": [
                                {
                                    "start": 48,
                                    "end": 71,
                                    "url": "https://t.co/lZ6LSlltxL",
                                    "expanded_url": "http://radiko.jp",
                                    "display_url": "radiko.jp"
                                }
                            ],
                            "hashtags": [
                                {
                                    "start": 85,
                                    "end": 93,
                                    "tag": "irisyou"
                                }
                            ]
                        }
                    },
                    "name": "芹澤優のせりざわーるど with you",
                    "pinned_tweet_id": "1292829175414321157",
                    "url": "https://t.co/xlL8hB9Uji",
                    "created_at": "2013-06-24T04:25:13.000Z",
                    "username": "radio_iris1422",
                    "location": "港区麻布台",
                    "profile_image_url": "https://pbs.twimg.com/profile_images/1006142486417321984/eghcJ2uC_normal.jpg",
                    "public_metrics": {
                        "followers_count": 8530,
                        "following_count": 5508,
                        "tweet_count": 6729,
                        "listed_count": 212
                    },
                    "id": "1542447492"
                }
            ]
        }
    }

    console.log(await module.exports(json))
})()