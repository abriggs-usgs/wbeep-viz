<template>
  <div id="story-chapters-container">
    <div
      v-for="chapter in mapStory.chapters"
      id="features"
      :key="chapter.id"
    >
      <section
        :id="chapter.id"
        :class="chapter.class"
        @click="moveToLocation(chapter.flyToCommands, chapter.id)"
        @mouseover="moveToLocation(chapter.flyToCommands, chapter.id)"
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
        data() {
            return {
                mapStory: mapStory
            };
        },
        methods: {
            moveToLocation(flyToCommands, elementId) {
                let allActiveSectionElements = document.querySelectorAll("section.active");
                [...allActiveSectionElements].forEach((selection) => {
                    selection.setAttribute('class', '');
                })
                document.getElementById(elementId).setAttribute('class', 'active');
                this.$store.map.flyTo(flyToCommands);
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
  }
</style>