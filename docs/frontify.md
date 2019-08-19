
# Frontify

## Synchronizing the FEF patterns to Frontify

FEF patterns can be synced to the srf frontify project by using the following command:

```gulp frontify --token <access_token>```


`<access_token>` is the frontify access token (it's stored in our password safe).


## What happens in the sync task?

1. Existing <span class="path">/public/assets</span> and <span class="path">/export/</span> folders are deleted.

2. FEF patternlab is built and placed in the <span class="path">/public/</span> folder (using the standard `gulp build` task).

3. A patternlab export is generated into the <span class="path">/export/</span> folder.

4. Some of the asset paths within the .html-files of the <span class="path">/export/</span> folder are changed to a frontify compatible path.

5. The javascript files <span class="path">/public/assets/js/vendor.js</span> and <span class="path">/public/assets/js/bundle.js</span> are concatinated and saved as a new <span class="path">/public/assets/frontify/frontify-bundle.js</span> file.

6. The patterns from the <span class="path">/export/</span> folder are synced via frontify api to frontify.

7. The assets from the <span class="path">/public/assets/</span> folder are synced via frontify api to frontify.
