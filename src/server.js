import axios from 'axios';

const api = axios.create({
  headers: {
    'content-type': 'multipart/form-data'
  }
});

export const uploadFile = async (formData) => {
  const { data } = await api.post('/upload', formData);

  const { code } = data;
  return { code };
};

export const getSign = async (filename) => {
  const { data } = await axios.get('/getSign', {
    params: { filename }
  });

  const { sign } = data;
  return { sign };
}

export const uploadPart = async (formData) => {
  const { data } = await api.post('/upload_part', formData);

  const { code } = data;
  return { code };
};

export const merge = async (params) => {
  const { data } = await axios.post('/merge', params);

  const { code } = data;
  return { code };
};