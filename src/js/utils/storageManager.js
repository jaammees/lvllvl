/** Check if storage is persisted already.
  @returns {Promise<boolean>} Promise resolved with true if current origin is
  using persistent storage, false if not, and undefined if the API is not
  present.
*/
async function isStoragePersisted() {
  return await navigator.storage && navigator.storage.persisted ?
    navigator.storage.persisted() :
    undefined;
}

/** Tries to convert to persisted storage.
  @returns {Promise<boolean>} Promise resolved with true if successfully
  persisted the storage, false if not, and undefined if the API is not present.
*/
async function persistStorage(callback) {

  if (!navigator.storage || !navigator.storage.persisted) {

    if(typeof callback != 'undefined') {
      callback('never');
    }

    return "never";
  }

  var persisted = await navigator.storage.persisted();
  if (persisted) {
    if(typeof callback != 'undefined') {
      callback('persisted');
    }

    return "persisted";
  }
      
  var persisted = await navigator.storage.persist();

  if(persisted) {
    if(typeof callback != 'undefined') {
      callback('persisted');
    }

    return "persisted";
  }


  if(typeof callback != 'undefined') {
    callback('never');
  }

  return "never";

}

/** Queries available disk quota.
  @see https://developer.mozilla.org/en-US/docs/Web/API/StorageEstimate
  @returns {Promise<{quota: number, usage: number}>} Promise resolved with
  {quota: number, usage: number} or undefined.
*/
async function showEstimatedQuota() {
  return await navigator.storage && navigator.storage.estimate ?
    navigator.storage.estimate() :
    undefined;
}

/** Tries to persist storage without ever prompting user.
  @returns {Promise<string>}
    "never" In case persisting is not ever possible. Caller don't bother
      asking user for permission.
    "prompt" In case persisting would be possible if prompting user first.
    "persisted" In case this call successfully silently persisted the storage,
      or if it was already persisted.
*/
async function tryPersistWithoutPromtingUser(callback) {
  if (!navigator.storage || !navigator.storage.persisted) {
    callback('never');
    return "never";
  }
  let persisted = await navigator.storage.persisted();
  if (persisted) {
    callback('persisted');
    return "persisted";
  }
  if (!navigator.permissions || !navigator.permissions.query) {
    callback('prompt');
    return "prompt"; // It MAY be successful to prompt. Don't know.
  }
  const permission = await navigator.permissions.query({
    name: "persistent-storage"
  });
  if (permission.status === "granted") {
    persisted = await navigator.storage.persist();
    if (persisted) {
      callback('persisted');
      return "persisted";
    } else {
      throw new Error("Failed to persist");
    }
  }
  if (permission.status === "prompt") {
    callback('prompt');
    return "prompt";
  }
  callback('never');
  return "never";
}

