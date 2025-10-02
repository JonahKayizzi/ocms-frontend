import CryptoJS from 'crypto-js';

const secretKey = 'bXmG`rk,&F,]Zf>&JB$4';

export const encrypt = (data) => {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data), secretKey,
  ).toString();

  return encrypted;
};

export const decrypt = (encrypted) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    const decrypted = JSON.parse(bytes.toString(
      CryptoJS.enc.Utf8,
    ));
    return decrypted;
  } catch (error) {
    return null;
  }
};
