module.exports = function future(promise) {  
    return promise.then(data => {
       return [null, data];
    }).catch(err => {
      if (typeof err === 'string') {
         return [new Error(err)];
      }
      return [err];
    })
 }
 