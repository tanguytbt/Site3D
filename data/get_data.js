let credits = []

function GetData() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let data_array = JSON.parse(this.responseText).values
            //console.log(data_array)

            for (let i = 1; i < data_array.length; i++) {
                let items = []
                let rowInfo = data_array[i]
                let rowImageNode = document.createTextNode(rowInfo[5])
                let rowImage = "./img/" + rowImageNode.nodeValue 
                items.push(rowImage)
                
                //titles
                let rowTitleNode = document.createTextNode(rowInfo[2])
                let rowTitle = rowTitleNode.nodeValue
                items.push(rowTitle)

                //credits 
                let rowAuthorNode = document.createTextNode(rowInfo[0] + " " + rowInfo[1] )
                let rowAuthor = rowAuthorNode.nodeValue
                items.push(rowAuthor)

                //date
                let rowDateNode = document.createTextNode(rowInfo[3] )
                let rowDate = rowDateNode.nodeValue
                items.push(rowDate)

                let rowCreditNode = document.createTextNode(rowInfo[7])
                let rowCredit = rowCreditNode.nodeValue
                items.push(rowCredit)

                // let rowAudioNode = document.createTextNode(rowInfo[7])
                credits.push(items)
            }
            
        }
    };
    xhttp.open("GET", "https://sheets.googleapis.com/v4/spreadsheets/1WtwrA3Bou1MluhOmcEFiJSNBVFt5aq_1821tFXLiehI/values/index?key=AIzaSyDhlpOIwLeSZUTfp1OUPRagso6CMgbMzOA");
    xhttp.send();
    // console.log(credits);
    return Promise.resolve(credits);
    
}


export{GetData}