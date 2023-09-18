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
