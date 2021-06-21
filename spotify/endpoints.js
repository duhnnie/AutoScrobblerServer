module.exports = {
  authURL: 'https://accounts.spotify.com/api/token',
  baseURL: 'https://api.spotify.com/v1',
  search: (query, type, market, limit, offset, include_external) => {
    let params = `q=${query}&type=${type}`;

    params += market ? `&market=${market}` : '';
    params += `&limit=${limit}&offset=${offset}`;
    params += include_external ? `&include_external=${include_external}` : '';

    return `/search?${encodeURI(params)}`;
  }
};
