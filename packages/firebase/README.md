# `@mantrix/firebase`

This package reserves shared Firebase integration boundaries. Browser client
initialization remains in each app because environment loading differs between
Next.js and Expo. Privileged Admin SDK code belongs only in
`firebase/functions`.
