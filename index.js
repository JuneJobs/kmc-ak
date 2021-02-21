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

const A_AK_B = xlsx.parse(fs.readFileSync(`${__dirname}/AK_B.xlsx`));
let B_KIKCD_B = xlsx.parse(fs.readFileSync(`${__dirname}/KIKcd_20210101_B.xlsx`));
const filtered_B_KIKCD_B = B_KIKCD_B[0].data.filter(function (el, idx, arr) {
    if(idx === 0) return false;
    return !(el[1] === arr[idx-1][1] && el[2] === arr[idx-1][2] && el[3] === arr[idx-1][3]);
});
B_KIKCD_B[0].data = filtered_B_KIKCD_B;

const E_KIK_X1 = xlsx.parse(fs.readFileSync(`${__dirname}/KIK_20201221_X.xlsx`));
const filtered_E_KIK_X1 = E_KIK_X1[0].data.filter(function (el, idx, arr) {
    if(idx === 0) return false;
    return !(el[1] === arr[idx-1][1] && el[2] === arr[idx-1][2] && el[3] === arr[idx-1][3]);
});
E_KIK_X1[0].data = filtered_E_KIK_X1;

//X2
const E_KIK_X2 = xlsx.parse(fs.readFileSync(`${__dirname}/KIK_20201221_X.xlsx`));
const filtered_E_KIK_X2 = E_KIK_X2[0].data.filter(function (el, idx, arr) {
    if(idx === 0) return false;
    return !(el[1] === arr[idx-1][1] && el[2] === arr[idx-1][2] && el[4] === arr[idx-1][4]);
});
E_KIK_X2[0].data = filtered_E_KIK_X2;

let today = new Date(); 
let year = today.getFullYear(); // 년도
let month = today.getMonth() + 1;  // 월
let date = today.getDate();
let fileName = `${year}${month}${date}`;

let emptyFlg = 0;
let missmatchFlg = 0;
let writer = (mode, filename, data) => {
    return new Promise((resolve) => {
        if(data === '') {
            if(mode === 'M') {
                if(emptyFlg === 0) {
                    data = '\uFEFF1단계,2단계,3단계,대조1단계,대조2단계,대조3단계\n';
                    // emptyFlg = 1;
                }
            } else {
                if(missmatchFlg === 0) {
                    data = '\uFEFF1단계,2단계,3단계\n';
                    // missmatchFlg = 1;
                }
            }
        }
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
let mainH = async (file1, file2, title1, title2, file1_si, file2_si) => {
    let headerCnt = 1;
    let matchedCnt = 0;
    let missedCnt = 0;
    let notExistCnt = 0;
    //비교 인덱스 설정
    let file1Idx0 = file1_si;
    let file1Idx1 = file1_si+1;
    let file1Idx2 = file1_si+2;
    let file1Idx3 = file1_si+3;
    let file2Idx0 = file2_si;
    let file2Idx1 = file2_si+1;
    let file2Idx2 = file2_si+2;
    let file2Idx3 = file2_si+3;
    fs.unlink(`${title1}by${title2}_Missmatch.csv`,(err)=>{ });
    fs.unlink(`${title1}by${title2}_Empty.csv`,(err)=>{  });
    await writer('E',`${fileName}${title1}by${title2}_matched.csv`, ``);
    await writer('M',`${fileName}${title1}by${title2}_Missmatch.csv`, ``);    
    await writer('E',`${fileName}${title1}by${title2}_Empty.csv`, ``);         
    for(var i = 1, iLen = file1[0].data.length; i < iLen ; i++) {
        for(var j = 1, jLen = file2[0].data.length; j< jLen; j++) {
            if(
                data_match(file1[0].data[i][file1Idx0], file2[0].data[j][file2Idx0]) 
            ) {
                if( 
                    data_match(file1[0].data[i][file1Idx0], file2[0].data[j][file2Idx0]) &&
                    data_match(file1[0].data[i][file1Idx1], file2[0].data[j][file2Idx1]) &&
                    data_match(file1[0].data[i][file1Idx2], file2[0].data[j][file2Idx2]) &&
                    data_match(file1[0].data[i][file1Idx3], file2[0].data[j][file2Idx3])
                ) {
                    matchedCnt ++;
                    await writer('E',`${fileName}${title1}by${title2}_matched.csv`, `${file1[0].data[i][file1Idx1]},${(file1[0].data[i][file1Idx2] === undefined) ? "" : file1[0].data[i][file1Idx2]},${(file1[0].data[i][file1Idx3] === undefined) ? "" : file1[0].data[i][file1Idx3]}\n`);
                    // console.clear();
                    // console.log(`진행률: ${((((i*j))/(iLen*jLen))*100).toFixed(2)}%, 일치 개수: ${matchedCnt}`);
                } else {
                    missedCnt ++;
                    // console.clear();
                    await writer('M',`${fileName}${title1}by${title2}_Missmatch.csv`, `${(file1[0].data[i][file1Idx1] === undefined) ? "" : file1[0].data[i][file1Idx1]},${(file1[0].data[i][file1Idx2] === undefined) ? "" : file1[0].data[i][file1Idx2]},${(file1[0].data[i][file1Idx3] === undefined) ? "" : file1[0].data[i][file1Idx3]},${(file2[0].data[j][file2Idx1] === undefined) ? "" : file2[0].data[j][file2Idx1]},${(file2[0].data[j][file2Idx2] === undefined) ? "" : file2[0].data[j][file2Idx2]},${(file2[0].data[j][file2Idx3] === undefined) ? "" : file2[0].data[j][file2Idx3]}\n`);
                    // console.log(`진행률: ${(((i*j)/(iLen*jLen))*100).toFixed(2)}%, 일치 개수: ${matchedCnt}`);
                }
                break;
            } else {
                if(j === file2[0].data.length-1) {
                    notExistCnt++;
                    // console.clear();
                    // console.log(file1[0].data[i], file2[0].data[j]);
                    await writer('E',`${fileName}${title1}by${title2}_Empty.csv`, `${(file1[0].data[i][file1Idx1] === undefined) ? "" : file1[0].data[i][file1Idx1]},${(file1[0].data[i][file1Idx2] === undefined) ? "" : file1[0].data[i][file1Idx2]},${(file1[0].data[i][file1Idx3] === undefined) ? "" : file1[0].data[i][file1Idx3]}\n`);
                    // console.log(`진행률: ${((((i*j))/(iLen*jLen))*100).toFixed(2)}%, 일치 개수: ${matchedCnt}`);
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
let mainB = async (file1, file2, title1, title2, file1_si, file2_si) => {
    let headerCnt = 1;
    let matchedCnt = 0;
    let missedCnt = 0;
    let notExistCnt = 0;
    //비교 인덱스 설정
    let file1Idx0 = file1_si;
    let file1Idx1 = file1_si+1;
    let file1Idx2 = file1_si+2;
    let file1Idx3 = file1_si+3;
    let file2Idx0 = file2_si;
    let file2Idx1 = file2_si+1;
    let file2Idx2 = file2_si+2;
    let file2Idx3 = file2_si+3;
    fs.unlink(`${title1}by${title2}_Missmatch.csv`,(err)=>{ });
    fs.unlink(`${title1}by${title2}_Empty.csv`,(err)=>{  });
    await writer('E',`${fileName}${title1}by${title2}_matched.csv`, ``);
    await writer('E',`${fileName}${title1}by${title2}_Empty.csv`, ``);            
    for(var i = 1, iLen = file1[0].data.length; i < iLen ; i++) {
        for(var j = 1, jLen = file2[0].data.length; j< jLen; j++) {
            /*
            if(
                data_match(file1[0].data[i][file1Idx0], file2[0].data[j][file2Idx0]) 
            ) {
                if( 
                    data_match(file1[0].data[i][file1Idx0], file2[0].data[j][file2Idx0]) &&
                    data_match(file1[0].data[i][file1Idx1], file2[0].data[j][file2Idx1]) &&
                    data_match(file1[0].data[i][file1Idx2], file2[0].data[j][file2Idx2]) &&
                    data_match(file1[0].data[i][file1Idx3], file2[0].data[j][file2Idx3])
                ) {
                    matchedCnt ++;
                    console.clear();
                    console.log(`진행률: ${((((i*j))/(iLen*jLen))*100).toFixed(2)}%, 일치 개수: ${matchedCnt}`);
                } else {
                    missedCnt ++;
                    console.clear();
                    await writer('M',`${title1}by${title2}_Missmatch.csv`, `${file1[0].data[i][file1Idx0]},${(file1[0].data[i][file1Idx1] === undefined) ? "" : file1[0].data[i][file1Idx1]},${(file1[0].data[i][file1Idx2] === undefined) ? "" : file1[0].data[i][file1Idx2]},${(file1[0].data[i][file1Idx3] === undefined) ? "" : file1[0].data[i][file1Idx3]},${file2[0].data[j][file2Idx0]},${(file2[0].data[j][file2Idx1] === undefined) ? "" : file2[0].data[j][file2Idx1]},${(file2[0].data[j][file2Idx2] === undefined) ? "" : file2[0].data[j][file2Idx2]},${(file2[0].data[j][file2Idx3] === undefined) ? "" : file2[0].data[j][file2Idx3]}\n`);
                    console.log(`진행률: ${(((i*j)/(iLen*jLen))*100).toFixed(2)}%, 일치 개수: ${matchedCnt}`);
                }
                break;
            } else {
                if(j === file2[0].data.length-1) {
                    notExistCnt++;
                    console.clear();
                    console.log(file1[0].data[i], file2[0].data[j]);
                    await writer('E',`${title1}by${title2}_Empty.csv`, `${file1[0].data[i][file1Idx0]},${(file1[0].data[i][file1Idx1] === undefined) ? "" : file1[0].data[i][file1Idx1]},${(file1[0].data[i][file1Idx2] === undefined) ? "" : file1[0].data[i][file1Idx2]},${(file1[0].data[i][file1Idx3] === undefined) ? "" : file1[0].data[i][file1Idx3]}\n`);
                    console.log(`진행률: ${((((i*j))/(iLen*jLen))*100).toFixed(2)}%, 일치 개수: ${matchedCnt}`);
                }
            }
            */
            // 행안부 파일에서 동리명이 다를경우 읍면동 중복
            if( 
                data_match(file1[0].data[i][file1Idx0], file2[0].data[j][file2Idx0]) &&
                data_match(file1[0].data[i][file1Idx1], file2[0].data[j][file2Idx1]) &&
                data_match(file1[0].data[i][file1Idx2], file2[0].data[j][file2Idx2]) 
            ) {
                matchedCnt ++;
                await writer('E',`${fileName}${title1}by${title2}_matched.csv`, `${file1[0].data[i][file1Idx0]},${(file1[0].data[i][file1Idx1] === undefined) ? "" : file1[0].data[i][file1Idx1]},${(file1[0].data[i][file1Idx2] === undefined) ? "" : file1[0].data[i][file1Idx2]}\n`);
                //console.clear();
                //console.log(`진행률: ${((((i*j))/(iLen*jLen))*100).toFixed(2)}%, 일치 개수: ${matchedCnt}`);
                break;
            } else {
                if(j === jLen-1)  {
                    notExistCnt++;
                    // console.clear();
                    //console.log(file1[0].data[i], file2[0].data[j]);
                    await writer('E',`${fileName}${title1}by${title2}_Empty.csv`, `${file1[0].data[i][file1Idx0]},${(file1[0].data[i][file1Idx1] === undefined) ? "" : file1[0].data[i][file1Idx1]},${(file1[0].data[i][file1Idx2] === undefined) ? "" : file1[0].data[i][file1Idx2]}\n`);
                    //console.log(`진행률: ${((((i*j))/(iLen*jLen))*100).toFixed(2)}%, 일치 개수: ${matchedCnt}`); 
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
mainH(A_KMC_H, B_KIKCD_H, 'H_Ai', 'H_Bj',1,0);
mainH(B_KIKCD_H, A_KMC_H, 'H_Bj', 'H_Ai',0,1);
mainB(A_AK_B, B_KIKCD_B, 'B_Ci', 'B_Dj',0,1);
mainB(B_KIKCD_B, A_AK_B, 'B_Dj', 'B_Ci',1,0);

//--
// mainH(A_KMC_H, E_KIK_X1, 'H_Ai', 'H_Xj',1,0);
// mainH(E_KIK_X1, A_KMC_H, 'H_Xj', 'H_Ai',0,1);
// mainB(A_AK_B, E_KIK_X1, 'B_Ai', 'B_Xj',0,1);
// mainB(E_KIK_X1, A_AK_B, 'B_Xj', 'B_Ai',1,0);
