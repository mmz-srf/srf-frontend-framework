# Frontify

## Synchronizing the FEF patterns to Frontify

FEF patterns can be synced to the srf frontify project by using the following command:

```shell
gulp frontify --token <access_token>
```

Hint: `<access_token>` is the frontify access token (it's stored in our password safe).


## What happens in the sync task?

1. Existing `/public/assets` and `/export/` folders are deleted.

2. FEF patternlab is built and placed in the `/public/` folder (using the standard `gulp build` task).

3. A patternlab export is generated into the `/export/` folder.

4. Some of the asset paths within the .html-files of the `/export/` folder are changed to a frontify compatible path.

5. The javascript files `/public/assets/js/vendor.js` and `/public/assets/js/bundle.js` are concatenated and saved as a new `/public/assets/frontify/frontify-bundle.js` file.

6. The patterns from the `/export/` folder are synced via frontify api to frontify.

7. The assets from the `/public/assets/` folder are synced via frontify api to frontify.
