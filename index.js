var xlsx = require('node-xlsx').default;
const fs = require('fs');

// Parse a buffer
const A_KMC_H = xlsx.parse(fs.readFileSync(`${__dirname}/KMC_2021016_H.xlsx`));
/**
 * 국가, 행정동코드, 1단계, 2단계, 3단계
 */

const B_KIKCD_H = xlsx.parse(fs.readFileSync(`${__dirname}/KIKcd_20210101_H.xlsx`));
/**
 * 행정동코드, 시도명, 시군구명, 읍면동명
 */


let writer = (filename, data) => {
    return new Promise((resolve) => {
        fs.appendFile(filename, data, function (err, res) {
            if (err) throw err; 
            resolve(true);
        });
    })
};
let data_match = (data1, data2) =>{
    if(data1 == data2) {
        return true;
    } else {
        if(data1 === "" && data2 === undefined) {
            return true;
        } else if(data1 === undefined && data2 === "") {
            return true;
        } else if(data1 === "" && data2 === "") {
            return true;
        } else if(data1 === undefined && data2 === undefined) {
            return true;
        } else {
            return false;
        }
    }
}
let main = async (file1, file2, title1, title2) => {
    let headerCnt = 1;
    let matchedCnt = 0;
    let missedCnt = 0;
    let notExistCnt = 0;
    fs.unlink(`${title1}by${title2}_Missmatch.csv`,(err)=>{ });
    fs.unlink(`${title1}by${title2}_Empty.csv`,(err)=>{  });
    for(var i = 1, iLen = file1[0].data.length; i < iLen ; i++) {
        for(var j = 1, jLen = file2[0].data.length; j< jLen; j++) {
            if(
                data_match(file1[0].data[i][0], file2[0].data[j][0]) 
            ) {
                if( 
                    data_match(file1[0].data[i][0], file2[0].data[j][0]) &&
                    data_match(file1[0].data[i][1], file2[0].data[j][1]) &&
                    data_match(file1[0].data[i][2], file2[0].data[j][2]) &&
                    data_match(file1[0].data[i][3], file2[0].data[j][3])
                ) {
                    matchedCnt ++;
                    console.clear();
                    console.log(`진행률: ${((((i*j))/(iLen*jLen))*100).toFixed(2)}%, 일치 개수: ${matchedCnt}`);
                } else {
                    missedCnt ++;
                    console.clear();
                    await writer(`${title1}by${title2}_Missmatch.csv`, `${file1[0].data[i][0]}, ${file1[0].data[i][1]}, ${file1[0].data[i][2]}, ${file1[0].data[i][3]},\t ${file2[0].data[j][0]}, ${file2[0].data[j][1]}, ${file2[0].data[j][2]}, ${file2[0].data[j][3]}\n`);
                    //await writer(`${title1}by${title2}_Missmatch.csv`, `${file1[0].data[i][0]}\n`);
                    console.log(`진행률: ${(((i*j)/(iLen*jLen))*100).toFixed(2)}%, 일치 개수: ${matchedCnt}`);
                }
                break;
            } else {
                if(j === file2[0].data.length-1) {
                    notExistCnt++;
                    console.clear();
                    await writer(`${title1}by${title2}_Empty.csv`, `${file1[0].data[i][0]}, ${file1[0].data[i][1]}, ${file1[0].data[i][2]}, ${file1[0].data[i][3]}\n`);
                    //await writer(`${title1}by${title2}_Empty.csv`, `${file1[0].data[i][0]}\n`);
                    console.log(`진행률: ${((((i*j))/(iLen*jLen))*100).toFixed(2)}%, 일치 개수: ${matchedCnt}`);
                }
            }
        }
    }

    console.log(`${title1} 개수: ${file1[0].data.length - headerCnt}`);
    console.log(`${title2} 개수: ${file2[0].data.length - headerCnt}`);
    console.log(`${title1} 기준 ${title1} = ${title2} 개수: ${matchedCnt}`);
    console.log(`${title1} 에 속하지만, ${title2}에 속하지 않는경우: ${file1[0].data.length - headerCnt - matchedCnt}`);
    console.log(`${title1} 에 있으나 주소 불일치: ${missedCnt}`);
    console.log(`${title1} 에 있으나 ${title2}에 없음: ${notExistCnt}`);
}

//main(A_KMC_H, B_KIKCD_H, 'Ai', 'Bj');
 main(B_KIKCD_H, A_KMC_H, 'Bj', 'Ai');
