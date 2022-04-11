const { time } = require("console");
const puppeteer = require("puppeteer");
const path = require("path");
const downloadPath = path.resolve("./media");
const fs = require("fs");
const pdfConverter = require("images-to-pdf");

class textToHand {
    static checkForLeftOverDetails(tthUserDetail, senderId, sock, chatId) {
        if (!tthUserDetail.get(senderId).hasOwnProperty("name")) {
            sock.sendMessage(chatId, {
                text: "Enter your name\n*Reply to this message with # as Prefix*",
            });
        } else if (!tthUserDetail.get(senderId).hasOwnProperty("secondField")) {
            sock.sendMessage(chatId, {
                text: "Enter the second thing to put below name\n*Reply to this Message with # as Prefix*",
            });
        } else if (!tthUserDetail.get(senderId).hasOwnProperty("heading")) {
            sock.sendMessage(chatId, {
                text: "Enter the heading of your content\n*Reply to this Message with # as Prefix*",
            });
        } else if (!tthUserDetail.get(senderId).hasOwnProperty("content")) {
            sock.sendMessage(chatId, {
                text: "Enter the content\n*Reply to this Message with # as Prefix*",
            });
        }
    }
    static async convert(
        sock,
        chatId,
        senderId,
        msg,
        _name,
        _secondField,
        _head,
        _cont
    ) {
        const browser = await puppeteer.launch({
            headless: false,
            args: ["--devtools-flags=disable"],
            defaultViewport: { width: 1280, height: 900 },
        });
        const page = await browser.newPage();
        await page.goto("https://saurabhdaware.github.io/text-to-handwriting/");
        await page.waitForSelector(".paper-content");

        let head = _head;

        let cont = _cont;
        let len = head.length;
        let countSpace = 72 - len;
        countSpace = Math.floor(countSpace / 2);
        let heading = "";
        let s1 = "";
        for (let i = 0; i < countSpace - 2; i++) {
            heading += "&nbsp";
        }

        heading = heading + head + "<br><br>";
        let finalContent = heading + cont;
        let space = "";
        for (let i = 0; i < 13; i++) {
            space += "&nbsp";
        }

        let topHeading = "";
        topHeading += space;
        let name = _name;
        name = name.split(" ");
        if (name.length < 2) {
            name = name[0] + "&nbsp&nbsp&nbsp";
        } else {
            name = name[0] + "&nbsp&nbsp&nbsp" + name[name.length - 1];
        }
        let secondField = _secondField;
        secondField = secondField.split(" ");
        let finalSecondField = "";
        for (let i = 0; i < secondField.length; i++) {
            if (secondField[i] !== " ") {
                finalSecondField += secondField[i];
            }
        }

        topHeading += name + "<br>" + space + finalSecondField;

        await page.evaluate(
            (finalContent, topHeading) => {
                let domHead = document.querySelector(".top-margin");
                domHead.innerHTML = topHeading;
                let dom = document.querySelector(".paper-content");
                dom.innerHTML = finalContent;
            },
            finalContent,
            topHeading
        );

        await Promise.all([
            //page.waitForNavigation(), // wait for navigation to happen
            page.click(".generate-image-button"), // click link to cause navigation
        ]);

        await page._client.send("Page.setDownloadBehavior", {
            behavior: "allow",
            downloadPath: downloadPath,
        });

        await page.waitForSelector(".download-image-button", { timeout: 100000 });

        setTimeout(async() => {
            const nodes = await page.$$(".download-image-button");
            let countOfImages = nodes.length;
            let i = 0;

            for (const el of nodes) {
                await el.click();

                console.log("clicked");
                await page.waitForTimeout(1000);
                await fs.rename(
                    "media/download.jpg",
                    `media/download${i++}.jpg`,
                    function(err) {
                        if (err) console.log(err.message);
                        else console.log("File Renamed.");
                    }
                );
            }
            const allImages = [];
            i = 0;

            for (i = 0; i < countOfImages; i++) {
                allImages.push(`media/download${i}.jpg`);
            }
            pdfConverter(allImages, `media/${_name}.pdf`);

            await sock.sendMessage(
                chatId, {
                    document: { url: `media/${_name}.pdf` },
                    mimetype: "application/pdf",
                    fileName: `${_name}.pdf`,
                }, { quoted: msg }
            );

            setTimeout(() => {
                browser.close();
                fs.rm(
                    `Media/${_name}.pdf`, { recursive: true, force: true },
                    (err) => {
                        if (err) console.log("Error");
                    },
                    10000
                );
            });
        }, 20000);
        console.log("Done");
    }
}
module.exports = textToHand;