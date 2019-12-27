<template>
  <div />
</template>
<script>
    import { icon } from "@fortawesome/fontawesome-svg-core";

    export default {
        name: "MapLayers",
        inject: ["mapbox", "map", "actions"],
        data() {
            return {
                control: null
            };
        },
        mounted() {
            this.createCustomControl(this.runGoogleAnalytics, this.$router);
        },
        methods: {
            runGoogleAnalytics(eventName, action, label) {
                this.$ga.set({ dimension2: Date.now() });
                this.$ga.event(eventName, action, label)
            },

            createCustomControl(googleAnalytics, router) {
                class customControl {
                    onAdd(map) {
                        this.map = map;
                        this.control = document.createElement("div");
                        this.control.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
                        this.button = document.createElement("button");
                        this.button.id = "icon-map-control-question";
                        this.button.className = "mapboxgl-ctrl-icon icon-map-control icon-map-control-question";
                        this.button.setAttribute("aria-label", "questions" );
                        this.button.onclick = function(e) {
                            googleAnalytics('about', 'click', 'user went to about page');
                            e.preventDefault();
                            e.stopPropagation();
                            router.push({ path: 'questionsandanswers' });
                        };
                        this.icon = document.createElement("span");
                        this.icon.innerHTML = icon({
                            prefix: "fas",
                            iconName: "question"
                        }).html;
                        this.button.appendChild(this.icon);
                        this.control.appendChild(this.button);
                        return this.control;
                    }
                    onRemove() {
                        this.control.parentNode.removeChild(this.control);
                        this.map = undefined;
                    }
                }
                const myCustomControl = new customControl();
                this.map.addControl(myCustomControl, "top-right");
            }
        }
    };
</script>

<style scoped lang="scss">
  .icon-map-control-question {
    transition: transform 1s;
    transform: skew(0deg, 0deg);
  }

  .icon-map-control-question:hover {
    transition: transform 1s;
    transform: skew(-15deg, 10deg);
  }
</style>
