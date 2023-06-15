let credits = []

function GetData() {
   return new Promise((resolve, reject) => {
        fetch("data/Site.csv") 
            .then(response => response.text())
            .then(csvData => {
                let data_array = CSVTOArray(csvData); 
                data_array.shift();
                console.log(data_array)

            for (let i = 1; i < data_array.length; i++) {
                let items = []
                let rowInfo = data_array[i]
                
                let rowImage = "./img/" + rowInfo[1] 
                items.push(rowImage)
                // console.log(rowInfo)
                
                //tag
                let rowTag = rowInfo[2]
                items.push(rowTag)

                //date
                let rowDate = rowInfo[3]
                items.push(rowDate)

                //date
                let rowType = rowInfo[4]
                items.push(rowType)

                // console.log(items)

                // let rowAudioNode = document.createTextNode(rowInfo[7])
                credits.push(items)
            }

            resolve(credits);  
        })
        .catch(error => {
            reject(new Error("failed to fetch data"));
        });
    });
}

function CSVTOArray(csvData) {
    let rows = csvData.split("\n");
    return rows.map(row => row.split(";"));
}
   
    

export{GetData};