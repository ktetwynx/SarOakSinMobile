import axios from 'axios';
import store from '../redux';

export const ApiFetchService = async (url: string, data: any, header: any) => {
  let axioOption: any;
  if (
    data != null
      ? (axioOption = {
          headers: header,
          method: 'POST',
          url: url,
          data: data,
        })
      : (axioOption = {
          headers: header,
          method: 'GET',
          url: url,
        })
  )
    return new Promise((resolve, reject) => {
      axios(axioOption)
        .then((response: any) => {
          resolve(response.data);
        })
        .catch((error: any) => {
          console.log(`URL -> ${url},${error}`);
          throw error;
        });
    });
};

// headers: {
//   'Content-Type': 'multipart/form-data',
//   Authorization: 'ApiKey f90f76d2-f70d-11ed-b67e-0242ac120002',
// },

// headers: {
//   'Content-Type': 'multipart/form-data',
//   Authorization: 'Bearer ' + store.getState().token,
// },
