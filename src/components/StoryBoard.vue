<template>
  <div id="story-chapters-container">
    <div
        id="features"
        v-for="chapter in mapStory.chapters"
        :key="chapter.id"
    >
      <section
        id="chapter.id"
        class="chapter.class"
        @click="moveToLocation(chapter.flyToCommands)"
        @mouseover="moveToLocation(chapter.flyToCommands)"
      >
        <h3>{{ chapter.title }}</h3>
        <p>
          {{ chapter.content }}
        </p>
      </section>

    </div>
  </div>
</template>
<script>
    import mapStory from "../assets/mapStory/mapStory";

    export default {
        name: "StoryBoard",
        props: {
            map: {
                type: Object,
                default: null
            }
        },
        data() {
            return {
                mapStory: mapStory
            };
        },
        methods: {
            moveToLocation(flyToComands ) {
                this.map.flyTo(flyToComands);
            }
        }
    };
</script>
<style scoped lang="scss">
  #features {
    font-family: sans-serif;
    background-color: #fafafa;
  }
  section {
    padding: 25px 50px;
    line-height: 25px;
    border-bottom: 1px solid #ddd;
    opacity: 0.25;
    font-size: 13px;
  }
  section.active {
    opacity: 1;
  }
  section:last-child {
    border-bottom: none;
    margin-bottom: 200px;
  }
</style>