/** Makes sure client value updating method doesn't
 *     need to handle any extra props.
 */
const convertForUpdate = function ({ name, route, ...otherProps }) {

  var forUpdate = {
    ...otherProps,
    route: route || name,
  };

  return forUpdate;

};  // End convertForUpdate()


export { convertForUpdate };
