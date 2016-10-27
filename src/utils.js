const data = require('../data/json/decision_tree_data.json');
const _ = require('underscore');

const UtilitiesModule = {
  getRecord: function(id) {
    return _.find(data, o => {
      return o.id === id
    });
  },
  getRecords: function(idList) {
    return _.filter(data, o => {
      return _.contains(idList, o.id);
    });
  }
}

module.exports = UtilitiesModule;
