const axios = require('axios');

var Api = {
    getData: function () {
        return axios.get('data.json')
            .then(function (response) {
                return JSON.parse(response.request.response);
            })
            .catch(function (error) {
                alert(error);
            });
    },
};

export default Api;
