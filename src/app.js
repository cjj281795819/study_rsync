import React, { useState, useRef } from 'react';
import { uploadFile, getSign, uploadPart, merge } from './server';

let createURL = null;
let worker = null;

let filename;
let check;

let file;

const TCP_MAX = 4;

const App = () => {
  const [radioValue, setRadioValue] = useState(false);
  const fileRef = useRef(null);

  const newWorker = () => {
    const textContent = document.getElementById('worker').textContent;
    const blob = new Blob([textContent]);
    createURL = window.URL.createObjectURL(blob);
    worker = new Worker(createURL);
  }

  const upload = async () => {
    file = fileRef.current.files[0];
    console.log(file)
    fileRef.current.value = null;
    filename = file.name;

    if (!file) return;

    if (!worker) {
      newWorker();
    };

    if (!radioValue) {

      worker.onmessage = async (e) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sign', e.data.result);
        formData.append('filename', filename);
        const result = await uploadFile(formData);
        console.log(result)
      };

      worker.postMessage({ file, type: 'GET_SIGN' });
    } else {
      const { sign } = await getSign(filename);
      worker.onmessage = (e) => {
        const { blobArr, checkResult } = e.data.result;
        console.log(checkResult)
        console.log(blobArr)
        check = checkResult;
        uploadBlobPart(0, blobArr);
      };

      worker.postMessage({ sign, file, type: 'GET_DELTA' });
    }
  };

  const uploadBlobPart = async (index, blobArr) => {
    let num = index;
    let tcp_num = 0;
    const uploadPartArr = [];
    while (tcp_num < TCP_MAX) {
      if (!blobArr[num]) {
        break;
      }

      const formData = new FormData();
      formData.append('file', blobArr[num].blob);
      formData.append('i', blobArr[num].i);
      formData.append('filename', filename);

      const uploadFunc = () => {
        return new Promise(async (res) => {
          const { code } = await uploadPart(formData);
          res(code);
        });
      };

      uploadPartArr.push(uploadFunc);

      num++;
      tcp_num++;
    };

    const result = await Promise.all(uploadPartArr.map(v => v()));
    result.map((v) => {
      if (v === 1) {
        console.log('上传片段成功');
      } else {
        throw new Error('上传失败');
      }
      return null;
    });

    if (num < blobArr.length) {
      uploadBlobPart(num, blobArr);
    } else {
      console.log('上传完成');
      worker.onmessage = async (e) => {
        const sign = e.data.result;
        const { code } = await merge({ filename, checkResult: check, sign });
        if (code === 1) {
          console.log('更新成功')
        } else {
          console.log('更新失败');
        }
      }

      worker.postMessage({ file, type: 'GET_SIGN' });
    }
  }


  return (
    <>
      <div>
        <input type="checkbox" checked={radioValue} onChange={() => setRadioValue(!radioValue)} />
      rsync
      </div>
      <input type="file" onChange={upload} ref={fileRef} />
    </>
  )
};

export default App;