import { View } from "backbone.marionette";
import template from "./StatsWidgetView.hbs"
import "./styles.scss";

class StatsWidgetView extends View {
  template = template;

  onRender() {
    // do nothing
  }
}

export default StatsWidgetView;
