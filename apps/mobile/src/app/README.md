# Application composition

The mobile app uses one typed React Navigation native stack. `AppNavigator.tsx`
is the composition root for route registration and the startup route. Screen
implementations live in `features/`; shared presentation primitives live in
`shared/`.

This project intentionally does not use Expo Router. Keeping the navigation
contract here avoids a second route-discovery system and preserves the existing
startup behavior.
