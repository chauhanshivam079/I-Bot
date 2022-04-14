const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
class ProductSearch {
    // Async function which scrapes the data
    static async search(sock, chatId, msg, productName) {
        if (productName === "") {
            await sock.sendMessage(
                chatId, { text: "Empty Parameter!" }, { quoted: msg }
            );
            return;
        }
        productName = productName.split(" ").join("+");
        const url = `https://www.smartprix.com/products/?q=${productName}`;
        try {
            // Fetch HTML of the page we want to scrape
            const { data } = await axios.get(url);

            // Load HTML we fetched in the previous line
            const $ = cheerio.load(data);

            const listItems = $("#search-result-items ul li .info h2 a");

            const product = { productName: "", productLink: "" };
            let pre = 0;

            listItems.each((idx, el) => {
                if (idx == 4) {
                    return false;
                }

                let tempProductName = $(el).text();
                let tempProductLink = "https://www.smartprix.com" + $(el).attr("href");
                let tempSplit = productName.split("+");
                let count = 0;
                console.log(tempProductName, tempSplit);
                tempSplit.forEach((namePart) => {
                    if (tempProductName.toLowerCase().includes(namePart.toLowerCase())) {
                        count++;
                    }
                });

                if (count > pre && count > tempSplit.length - 2 && count > 0) {
                    pre = count;

                    product.productName = tempProductName;
                    product.productLink = tempProductLink;
                }
            });

            console.log(product);

            if (product.productName === "") {
                await sock.sendMessage(
                    chatId, {
                        text: `Sorry!! No result found for ${productName
              .split("+")
              .join(" ")}`,
                    }, { quoted: msg }
                );
            } else {
                //Now fetching all price comparisons of product

                const { data } = await axios.get(product.productLink);

                const $ = cheerio.load(data);
                const specs = $(".product-features ul li");

                let features = "";
                specs.each((idx, feature) => {
                    features += $(feature).text() + "\n";
                });
                const productDesc = {
                    productName: `*${$("#page-heading h1").text()}*`,
                    productImg: $(".large-img img").attr("src"),
                    productSpecs: features,
                };

                if (!$("#compare-prices .notavailable").length) {
                    const allSellers = $("#compare-prices tbody tr td");
                    const productRedirectArr = [];

                    allSellers.each((idx, seller) => {
                        if ($(seller).text() === "Used / Refurbished Products")
                            return false;

                        if ($(seller).hasClass("store-logo")) {
                            if (
                                $(seller).children("div").children("a").attr("title") ===
                                "Flipkart" &&
                                !$($(seller).parent()).hasClass("stock_OUT_OF_STOCK")
                            ) {
                                productRedirectArr.push({
                                    sellerName: $(seller)
                                        .children("div")
                                        .children("a")
                                        .attr("title"),
                                    sellerLink: $(seller)
                                        .children("div")
                                        .children("a")
                                        .attr("href"),
                                });
                            }
                            if (
                                $(seller).children("div").children("a").attr("title") ===
                                "Amazon" &&
                                !$($(seller).parent()).hasClass("stock_OUT_OF_STOCK")
                            ) {
                                console.log("amazon");
                                productRedirectArr.push({
                                    sellerName: $(seller)
                                        .children("div")
                                        .children("a")
                                        .attr("title"),
                                    sellerLink: $(seller)
                                        .children("div")
                                        .children("a")
                                        .attr("href"),
                                });
                            }
                        }
                    });
                    console.log(productRedirectArr);

                    //extracting data from flipkart and amazon
                    let price;
                    let link;
                    for (let i = 0; i < productRedirectArr.length; i++) {
                        try {
                            const { data } = await axios.get(
                                productRedirectArr[i].sellerLink
                            );

                            const $ = cheerio.load(data);

                            //getting flipkart site price of the product
                            if (productRedirectArr[i].sellerName === "Flipkart") {
                                if ($("._2RZvAZ").length) {
                                    throw "Error";
                                }

                                price = $("._16Jk6d").text();

                                const allLinks = $("head link");
                                allLinks.each((idx, el) => {
                                    if ($(el).attr("rel") === "canonical") {
                                        link = $(el).attr("href");
                                    }
                                });
                            }
                            //getting amazon site price of the product
                            if (productRedirectArr[i].sellerName === "Amazon") {
                                price = $(".priceToPay .a-offscreen").text();
                                if (price === "") {
                                    price = $(".apexPriceToPay .a-offscreen").text();
                                }
                                const allLinks = $("body #a-page link");
                                allLinks.each((idx, el) => {
                                    if ($(el).attr("rel") === "canonical") {
                                        link = $(el).attr("href");
                                    }
                                });
                            }
                        } catch (err) {
                            console.log(err);
                            price = "Not Available";
                            link = "";
                        }
                        console.log(link);
                        if (productRedirectArr[i].sellerName === "Flipkart") {
                            productDesc.flipkartPrice = price;
                            productDesc.flipkartLink = link;
                        }
                        if (productRedirectArr[i].sellerName === "Amazon") {
                            productDesc.amazonPrice = price;
                            productDesc.amazonLink = link;
                        }
                    }
                } else {
                    const notAvailableMsg = $(".notavailable").text();

                    productDesc.productName =
                        productDesc.productName + `\n\n${notAvailableMsg}`;
                }

                //if product not available on any site the this object will not have siteprice property so we assigning not available
                if (!productDesc.hasOwnProperty("flipkartPrice")) {
                    productDesc.flipkartPrice = "Not Available";
                    productDesc.flipkartLink = "";
                }
                if (!productDesc.hasOwnProperty("amazonPrice")) {
                    productDesc.amazonPrice = "Not Available";
                    productDesc.amazonLink = "";
                }
                console.log(productDesc);
                let result = `${productDesc.productName} ​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​\n\nAMAZON : ${productDesc.amazonPrice}\n\nFLIPKART : ${productDesc.flipkartPrice}\n\n\nSpecifications :\n ${productDesc.productSpecs}`;
                let flag = 0;
                const templateButtons = [];
                const dispButton1 = {
                    index: 1,
                    urlButton: {
                        displayText: "Flipkart",
                        url: productDesc.flipkartLink,
                    },
                };
                const dispButton2 = {
                    index: 2,
                    urlButton: {
                        displayText: "Amazon",
                        url: productDesc.amazonLink,
                    },
                };
                if (productDesc.flipkartPrice !== "Not Available") {
                    flag = 1;
                    templateButtons.push(dispButton1);
                }
                if (productDesc.amazonPrice !== "Not Available") {
                    flag = 1;
                    templateButtons.push(dispButton2);
                }
                const templateMessage = {
                    text: "",
                    templateButtons: templateButtons,
                    footer: "",
                };

                await sock.sendMessage(
                    chatId, {
                        image: { url: productDesc.productImg },
                        caption: result,
                    }, { quoted: msg }
                );
                if (flag) await sock.sendMessage(chatId, templateMessage);
            }
        } catch (err) {
            console.error(err);
        }
    }
}
module.exports = ProductSearch;