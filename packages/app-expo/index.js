// crypto polyfill — MUST be the very first import (before any core/lib code)
import "react-native-get-random-values";

import { registerRootComponent } from "expo";
import App from "./src/App";

registerRootComponent(App);
