# tweet-json-to-html

tweet-json-to-html converts Twitter API v2 tweet json object into html format.

## Install

```
npm i tweet-json-to-html
```

## Usage

Simply import the package and use it as a function:

```javascript
const tweetJsonToHtml = require('tweet-json-to-html')
const html = await tweetJsonToHtml(tweetJson, 'dim')
```
Here `tweetJson` should contain all possible information. Below is a sample Tweet lookup API URL requested to contain all possible information.

```url
https://api.twitter.com/2/tweets/1295916604127981568?expansions=attachments.poll_ids,attachments.media_keys,author_id,entities.mentions.username,geo.place_id,in_reply_to_user_id,referenced_tweets.id,referenced_tweets.id.author_id&poll.fields=duration_minutes,end_datetime,id,options,voting_status&media.fields=duration_ms,height,media_key,preview_image_url,type,url,width,public_metrics&place.fields=contained_within,country,country_code,full_name,geo,id,name,place_type&tweet.fields=attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,public_metrics,possibly_sensitive,referenced_tweets,source,text,withheld&user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld
```

### tweetJsonToHtml(tweetJson, [background])

Avaliable properties for `background`:

- **default** (Default)
- **dim**
- **lights-out**

## License

MIT License

Copyright (c) 2020-2022 Elenchus(sijongyeoil)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
