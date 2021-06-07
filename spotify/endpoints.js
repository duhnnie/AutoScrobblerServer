module.exports = {
  search: (query, type, market = null, limit =  20, offset = 0) => {
    let params = `q=${query}&type=${type}`;

    params += market ? `&market=${market}` : '';
    params += `&limit=${limit}&offset=${offset}`;

    return `/search?${encodeURI(params)}`;
  }
};