# `PATH /explore`

Get the `query` query parameter, and the `type` parameter.

The `query` is a filter word for users and quizzes.
The `type` is either `user`, or `quiz`.

The title should look something like `Search results for "Query"`.

Below are two [Joy UI Tabs](https://mui.com/joy-ui/react-tabs/) representing the result type, either `user` or `quiz`. The default is `quiz`, unless `type` is specified.

When a tab is open, it will show search results for that type of item.

Look at `GET /api/quiz` and `GET /api/user` for more info on the results.

The result items will have simple information about the quiz, and stats. The items will be cards, with a variable amount per row: fine tune to figure out the best width for the cards. Worst case just ditch that and have rows.

Clicking on any of the results bring the user to their respective page.