const axios = require("axios");
const cheerio = require("cheerio");

module.exports = snapsave = (url) => {
  return new Promise(async (resolve) => {
    try {
      if (
        !url.match(
          /(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/
        ) &&
        !url.match(/(https|http):\/\/www.instagram.com\/(p|reel|tv|stories)/gi)
      )
        return resolve({
          developer: "@Alia Uhuy",
          status: false,
          msg: `Link Url not valid`,
        });
      function decodeSnapApp(args) {
        let [h, u, n, t, e, r] = args;
        // @ts-ignore
        function decode(d, e, f) {
          const g =
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/".split(
              ""
            );
          let h = g.slice(0, e);
          let i = g.slice(0, f);
          // @ts-ignore
          let j = d
            .split("")
            .reverse()
            .reduce(function (a, b, c) {
              if (h.indexOf(b) !== -1)
                return (a += h.indexOf(b) * Math.pow(e, c));
            }, 0);
          let k = "";
          while (j > 0) {
            k = i[j % f] + k;
            j = (j - (j % f)) / f;
          }
          return k || "0";
        }
        r = "";
        for (let i = 0, len = h.length; i < len; i++) {
          let s = "";
          // @ts-ignore
          while (h[i] !== n[e]) {
            s += h[i];
            i++;
          }
          for (let j = 0; j < n.length; j++)
            s = s.replace(new RegExp(n[j], "g"), j.toString());
          // @ts-ignore
          r += String.fromCharCode(decode(s, e, 10) - t);
        }
        return decodeURIComponent(encodeURIComponent(r));
      }
      function getEncodedSnapApp(data) {
        return data
          .split("decodeURIComponent(escape(r))}(")[1]
          .split("))")[0]
          .split(",")
          .map((v) => v.replace(/"/g, "").trim());
      }
      function getDecodedSnapSave(data) {
        return data
          .split('getElementById("download-section").innerHTML = "')[1]
          .split('"; document.getElementById("inputData").remove(); ')[0]
          .replace(/\\(\\)?/g, "");
      }
      function decryptSnapSave(data) {
        return getDecodedSnapSave(decodeSnapApp(getEncodedSnapApp(data)));
      }
    //   const html = await got
    //     .post("https://snapsave.app/action.php?lang=id", {
    //       headers: {
    //         accept:
    //           "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    //         "content-type": "application/x-www-form-urlencoded",
    //         origin: "https://snapsave.app",
    //         referer: "https://snapsave.app/id",
    //         "user-agent":
    //           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
    //       },
    //       form: { url },
    //     })
    //     .text();
    let d = new FormData();
    d.append("url", `${url}`);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://snapsave.app/action.php?lang=en",
      headers: {
        authority: "snapsave.app",
        accept: "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        cookie:
          "_ga=GA1.1.637160271.1699078564; _pubcid=f27c8d65-3a69-47f3-92db-18e53600e763; _pubcid_cst=zix7LPQsHA%3D%3D; __gads=ID=dece7b1cd78e1429:T=1699078566:RT=1699078566:S=ALNI_MbNsFci7WamzOcasNWZdclXzaQLaw; __gpi=UID=00000c7f858fa948:T=1699078566:RT=1699078566:S=ALNI_MZKcwGD9hzrXUjt2VErdls-K6dUtg; __jscuActive=true; cto_bundle=hY7BQV9wQktraHVGSyUyRlNNdU1yY0VYMjJsVGthNW9MSVMlMkJKSlZsZGJXM1llNDNIVGhPQVp4aGlNeUNkb3BERGNTdThUOWVXMUlES05nNkdnczhpTjNtRUtITkpCbDZrNDlhRk1ZUEw2a3JrSWhPeWZ5WjVWNE5HUVpacjY5cTBqN0Vhc0haZlZ1QXJ4WkFITGNRdHYzJTJGbWYxakZ5QWNsWWxpUXRIQ3pCb0lKZ2pUZU15cjluSkRrYWhRSUJGUkpPWFEwd1E; cto_bidid=yENKVl9lbjhYdGk4cWxIMlZEOHdoS3NzUmhqaEJqVG9nYngxWHF5Q2g2dmx6Q3BaMVRwNHFyYmp5ZU04MjluTTJiSENUc0NRNEdqajZwaW5udHVXSDI5WktPQU1RMjU1SkhLcjZZOGZMeUo1ZjNkJTJCaUNzZTR4YmFyVDhZQVFNaGREdEZCQyUyRjEwVDdHbDQ3VnF6TkE1ZkZaWnh3JTNEJTNE; FCNEC=%5B%5B%22AKsRol9eL0U1Z0CA-RCO6LcyUStfsFwvMcBXw42B2-SzO7B9V_TnIhBT6v0oZr9fDTRP2q9rReUItxgT513W5WP9maDEfMZ-7Ltmz-TgHiWv9GRmqf_rbH5d3B8PwQODz78U3uH3jm56CfI7eTBOKK2EXjBLA06HZQ%3D%3D%22%5D%2Cnull%2C%5B%5B5%2C%22254%22%5D%5D%5D; _ga_WNPZGVDWE9=GS1.1.1699078563.1.1.1699078654.46.0.0",
        origin: "https://snapsave.app",
        referer: "https://snapsave.app/",
        "sec-ch-ua":
          '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
      },
      data: d,
    };
    const {data: html} = await axios.request(config);
      const decode = decryptSnapSave(html);
      const $ = cheerio.load(decode);
      const results = [];
      if ($("table.table").length || $("article.media > figure").length) {
        const thumbnail = $("article.media > figure").find("img").attr("src");
        $("tbody > tr").each((_, el) => {
          const $el = $(el);
          const $td = $el.find("td");
          const resolution = $td.eq(0).text();
          let _url =
            $td.eq(2).find("a").attr("href") ||
            $td.eq(2).find("button").attr("onclick");
          const shouldRender = /get_progressApi/gi.test(_url || "");
          if (shouldRender) {
            _url = /get_progressApi\('(.*?)'\)/.exec(_url || "")?.[1] || _url;
          }
          results.push({
            resolution,
            thumbnail,
            url: _url,
            shouldRender,
          });
        return false;
        });
      } else {
        $("div.download-items__thumb").each((_, tod) => {
          const thumbnail = $(tod).find("img").attr("src");
          $("div.download-items__btn").each((_, ol) => {
            let _url = $(ol).find("a").attr("href");
            if (!/https?:\/\//.test(_url || ""))
              _url = `https://snapsave.app${_url}`;
            results.push({
              thumbnail,
              url: _url,
            });
            return false;
          });
        });
      }
      if (!results.length){
        return resolve({
          developer: "Shivam",
          status: false,
          msg: `Blank data`,
        });
    }
      return resolve({ developer: "Shivam", status: true, data: results });
    } catch (e) {
      return resolve({ developer: "Shivam", status: false, msg: e.message });
    }
  });
};
