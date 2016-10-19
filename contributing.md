# Contributing to Fibi

The workflow for making contributions to Fibi is flexible and can change over
time. For now, we use develop-named remote branches to save our work remotely,
and the contributor can subsequently make pull requests in order to merge the
changes with master.

Below are some common worflows that you'll find helpful

## Create a local dev branch

```
git checkout -B <my_initials>-dev # e.g. nb-dev
# change some changes
git add path/to/file # or git add --all
git commit -m "informative commit message"
git push origin <my_initials>-dev
```

## Make a Pull Request

1. On the [fibi repo](https://github.com/cosmicBboy/fibi-bot), navigate to your
   remote development branch by clicking on the `Branch: master` button
   dropdown and selecting your development branch.
2. Click on the `New pull request` button.
3. Write an informative commit message with a comment if necessary, and then
   click on `Create pull request`.
4. The commit must then be reviewed by another developer before it is rebased
   onto master.
5. Once the pull request is reviewed and approved, click on the dropdown button
   next to `Merge pull request` and click on `Rebase and merge`. Thie ensures
   that we maintain a single, human-readable commit history.
