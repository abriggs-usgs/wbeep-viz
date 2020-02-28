<template>
  <div id="legendContainer">
    <div
        v-show="!isLegendHidden"
        id="tabs"
    >
      <div
          id="minimizeTab"
          class="tab"
      >
        <a
            id="legendMinimize"
            class="tabIcon"
            aria-label="close legend dialog box"
            @click="runGoogleAnalytics('legend', 'click', 'user reduced legend'), legendToggle()"
        >
          <font-awesome-icon icon="angle-down"/>
        </a>
      </div>
      <div
          id="infoTab"
          class="tab"
      >
        <a
            id="legendInfoButton"
            class="tabIcon"
            aria-label="open information dialog box"
            @click="runGoogleAnalytics('legend', 'click', 'user clicked info icon'), modalToggle()"
        >
          <font-awesome-icon
              v-if="!isInfoShowing"
              icon="info"
          />
          <font-awesome-icon
              v-else
              icon="list"
          />
        </a>
      </div>
    </div>
    <div
        v-show="!isLegendHidden && !isInfoShowing"
        id="legend"
    >
      <div id="legendTitle">
        <p>{{ legendTitle }}</p>
      </div>
      <div id="keysAndText"/>
    </div>
    <LegendModal
        v-show="isInfoShowing && !isLegendHidden"
        @clickedX="modalToggle()"
    />
    <div
        v-show="isLegendHidden"
        id="collapsedLegend"
    >
      <div id="collaspedLegendText">
        <p>Legend</p>
      </div>
      <div id="collapsedLegendIcon">
        <a
            id="legendPlus"
            class="legendIcon"
            aria-label="close extended legend box"
            @click="runGoogleAnalytics('legend', 'click', 'user expanded legend'), legendToggle()"
        >
          <font-awesome-icon icon="angle-left"/>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
    import mapStyles from "../assets/mapStyles/mapStyles";
    import LegendModal from "./LegendModal";

    export default {
        name: "MapLegend",
        components: {
            LegendModal
        },
        props: {
            legendTitle: {
                type: String,
                default: "Add your title for the legend in MapBox.vue or make this blank"
            }
        },
        data() {
            return {
                legend: null,
                isLegendHidden: false,
                isInfoShowing: false
            };
        },
        methods: {
            runGoogleAnalytics(eventName, action, label) {
                this.$ga.set({dimension2: Date.now()});
                this.$ga.event(eventName, action, label);
            },
            legendToggle() {
                this.isLegendHidden = !this.isLegendHidden;
            },
            modalToggle() {
                this.isInfoShowing = !this.isInfoShowing;
            },
            createLegend() {
                const map = this.$store.map;
                const hruStyleObjectFromStyleSheet = mapStyles.style.layers.filter(function (styleObject) { // The text labels for the legend are stored in the style sheet, so we need to grab the right layer style object from the sheet
                    return styleObject.id === 'HRUs'
                });
                const legendTextValues = [];
                hruStyleObjectFromStyleSheet[0].legendText.forEach(function (valuePair) { // Use the style object we grabbed from the style sheet and pull out the legend text labels
                    legendTextValues.push(valuePair[1]);
                });

                const layersFromMapObject = map.getStyle().layers; // Since the color pallet can change, we can't use the style sheet for those values and we need to get them from the map object.
                const hruStyleObjectFromMemory = layersFromMapObject.filter(function (styleObject) {
                    return styleObject.id === 'HRUs'
                });
                const legendColorValues = [];
                hruStyleObjectFromMemory[0]['paint']['fill-extrusion-color']['stops'].forEach(function (colorValuePair) {
                    legendColorValues.push(colorValuePair[1]);
                });

                let legend = this.legend;
                legend = document.getElementById("keysAndText");
                // Remove any keys and values that might be in the legend, so it will start fresh and clean.
                while (legend.firstChild) {
                    legend.removeChild(legend.lastChild);
                }
                // Start adding new legend keys and values
                legendTextValues.forEach(function (textValue, index) {
                    let item = document.createElement("div");
                    item.className = "legend-values-n-keys";
                    let keyContainer = document.createElement("div");
                    let textContainer = document.createElement("div");
                    let key = document.createElement("div");
                    let value = document.createElement("div");
                    item.style.minHeight = "20px";
                    item.style.display = "flex";
                    keyContainer.style.flex = 1;
                    textContainer.style.flex = 1;
                    key.style.backgroundColor = legendColorValues[index];
                    key.style.height = "25px";
                    value.style.fontSize = ".85em";
                    value.style.userSelect = "none";
                    value.style.lineHeight = "25px";
                    value.style.paddingLeft = "10px";
                    value.innerHTML = textValue;
                    keyContainer.appendChild(key);
                    textContainer.appendChild(value);
                    item.appendChild(keyContainer);
                    item.appendChild(textContainer);
                    legend.appendChild(item);
                });
            }
        }
    };
</script>

<style scoped lang="scss">
  $border: 1px solid rgb(200, 200, 200);
  $background: rgb(255, 255, 255);
  $borderRadius: 5px;
  $fontSizeMobile: 0.8em;
  $fontSizeDesktop: 0.9em;
  $arrowHeight: 21px;
  $arrowWidth: 21px;
  $buttonColorActive: #003366;
  $buttonActiveTextColor: #fff;

  #legendContainer {
    display: flex;
    min-height: 20px;
    min-width: 100px;
    position: absolute;
    bottom: 10px;
    left: 10px;
    z-index: 1000;

    p {
      margin: 0;
    }

    a {
      display: inline-block;
      width: 100%;
      height: 100%;
      text-align: center;
      cursor: pointer;
    }
  }

  #legend {
    background: $background;
    border: $border;
    border-radius: $borderRadius 0 $borderRadius $borderRadius;
    overflow: hidden;
  }

  #collapsedLegend {
    display: flex;
    background: $background;
    border-radius: $borderRadius;
    overflow: hidden;
  }

  #collaspedLegendText {
    flex: 1;
    padding: 5px 5px;
    font-size: .9em;
  }

  #collapsedLegendIcon {
    width: 25px;
    border-left: $border;

    a {
      &:active {
        background: $buttonColorActive;
        color: $buttonActiveTextColor;
      }

      svg {
        height: $arrowHeight;
        width: $arrowWidth;
        margin: 4px 0 0 0;
      }
    }
  }

  #tabs {
    height: 60px;
    width: 25px;
    order: 2;
    background: $background;
    border-radius: 0 $borderRadius $borderRadius 0;
    border-top: $border;
  }

  .tab {
    height: 30px;
  }

  .tabIcon {
    display: inline-block;
    width: 100%;
    height: 100%;
    text-align: center;
    cursor: pointer;

    &:active {
      background: $buttonColorActive;
      color: $buttonActiveTextColor;
    }

    svg {
      margin: 7px 0 0 0;
    }
  }

  #legendMinimize {
    border-bottom: $border;

    svg {
      height: $arrowHeight;
      width: $arrowWidth;
      margin: 3px 0 0 0;
    }
  }

  #legendTitle {
    padding: 0 5px;
    border-bottom: $border;
    height: 30px;
    line-height: 30px;

    p {
      font-size: 0.9em;
    }
  }

  @media screen and (min-width: 960px) {
    .tab {
      &:hover {
        background: $buttonColorActive;
        color: $buttonActiveTextColor;
      }
    }

    #collapsedLegendIcon {
      a {
        &:hover {
          background: $buttonColorActive;
          color: $buttonActiveTextColor;
        }
      }
    }
  }
</style>
