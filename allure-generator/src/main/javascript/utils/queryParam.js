import { history } from "backbone";

/**
 * initializing here because this stupid linting
 * is not allowing backtildes for strings if
 * it doesn't have any expressions
 */
const COLON = ":"
const COMMA = ","

export function getQueryParams() {
  let queryParams = {};
  const search = history.getFragment().split("?")[1]

  if (search) {
    const params = decodeURI(search)
      .replace(/&/g, `"${COMMA}"`)
      .replace(/=/g, `"${COLON}"`)
    queryParams = JSON.parse(`{"${params}"}`);
  }

  return queryParams;
}

export function stringifyParams(queryParams) {
  const uri = JSON.stringify(queryParams)
    .replace(/,/g, "&")
    .replace(/:/g, "=")
    .replace(/{/g, "")
    .replace(/}/g, "")
    .replace(/"/g, "");
  return encodeURI(uri);
}

export function updateQueryParams(key, value, defaultValue) {
  const fragment = history.getFragment().split("?")[0]
  const params = getQueryParams();

  if(value === defaultValue) {
    delete params[key];
  } else {
    params[key] = value;
  }

  const uri = stringifyParams(params);
  const newUrl = `/${fragment}?${uri}`;

  history.navigate(newUrl, { trigger: false, replace: true });
}
