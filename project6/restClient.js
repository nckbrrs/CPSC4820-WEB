import {
  GET_LIST,
  GET_ONE,
  GET_MANY,
  GET_MANY_REFERENCE,
  CREATE,
  UPDATE,
  DELETE,
  fetchUtils,
} from 'admin-on-rest';

import {stringify} from 'query-string';

const API_URL = 'MY.API.URL';

/**
 * @param {String} type One of the constants appearing at the top of this file, e.g. 'UPDATE'
 * @param {String} resource Name of the resource to fetch, e.g. 'posts'
 * @param {Object} params the REST request params, depending on the type
 * @returns {Object} {url, options} the HTTP request parameters
 */

 const convertRESTRequestToHTTP = (type, resource, params) => {
   let url ='';
   const options = {};
   switch (type) {
     case GET_LIST: {
       const { page, perPage } = params.pagination;
       const { field, order } = params.sort;
       const query = {
         sort: JSON.stringify([field, order]),
         range: JSON.stringify([(page -1) * perPage, page * perPage - 1]),
         filter: JSON.stringify(params.filter),
       };
       url = `${API_URL}/${resource}?${stringify(query)}`;
       break;
     }
     case GET_ONE: {
       url = `${API_URL}/${resource}/${params.id}`;
       break;
     }
     case GET_MANY: {
     const query = {
       filter: JSON.stringify({ id: params.id }),
     };
     url = `${API_URL}/${resource}?${stringify(query)}`;
     break;
    }
    case GET_MANY_REFERENCE: {
      const { page, perPage } = params.pagination;
      const { field, order } = params.sort;
      const query = {
          sort: JSON.stringify([field, order]),
          range: JSON.stringify([(page - 1) * perPage, (page * perPage) - 1]),
          filter: JSON.stringify({ ...params.filter, [params.target]: params.id }),
      };
      url = `${API_URL}/${resource}?${stringify(query)}`;
      break;
    }
    case UPDATE: {
      url = `${API_URL}/${resource}/${params.id}`;
      options.method = 'PUT';
      options.body = JSON.stringify(params.data);
      break;
    }
    case CREATE: {
      url = `${API_URL}/${resource}`;
      options.method = 'POST';
      options.body = JSON.stringify(params.data);
      break;
    }
    case DELETE: {
      url = `${API_URL}/${resource}/${params.id}`;
      options.method = 'DELETE';
      break;
    }
    default: {
      throw new Error(`Unsupported fetch action type ${type}`);
    }
    return { url, options };
  }
};

/**
* @param {Object} response HTTP response from fetch()
* @param {String} type One of the constants appearing at the top if this file, e.g. 'UPDATE'
* @param {String} resource Name of the resource to fetch, e.g. 'posts'
* @param {Object} params The REST request params, depending on the type
* @returns {Object} REST response
*/
const convertHTTPResponseToREST = (response, type, resource, params) => {
  const { headers, json } = response;
  switch (type) {
    case GET_LIST:
      return {
        data: json.map(x => x),
        total: parseInt(headers.get('content-range').split('/').pop(), 10),
      };
    case CREATE: {
      return {data: { ...params.data, id: json.id } };
    }
    default: {
      return { data: json };
    }
  }
};