<template>
  <div class="usa-prose provisional-statement">
    <button @click="mapLog()">get the map</button>
    <div v-show="!isFullProvisionalStatementShowing">
      <div class="statement-condensed">
        <span>
          This information is PRELIMINARY and PROVISIONAL 
          <button
            v-ga="$ga.commands.trackName.bind(this, 'button-provisionalStatement-enlarge', 'click', 'user enlarged the provisional statement')"
            aria-label="learn more about provisional statement"
            @click="toggleProvisionalStatement"
          >
            Learn More
          </button>
        </span>
      </div>
    </div>
    <div v-show="isFullProvisionalStatementShowing">
      <div class="statement-expanded">
        <p>
          This information is preliminary or provisional and is subject to revision. It is being provided to meet the need
          for timely best science. The information has not received final approval by the U.S. Geological Survey (USGS) and
          is provided on the condition that neither the USGS nor the U.S. Government shall be held liable for any damages
          resulting from the authorized or unauthorized use of the information.
        </p>
        <button
          v-ga="$ga.commands.trackName.bind(this, 'button-provisionalStatement-reduce', 'click', 'user reduced the provisional statement')"
          aria-label="close provisional statement"
          @click="toggleProvisionalStatement"
        >
          I understand
        </button>
      </div>
    </div>
  </div>
</template>

<script>
    export default {
        name: "ProvisionalStatement",
        data() {
            return {
               isFullProvisionalStatementShowing: false
            }
        },
        computed: {
            map() {
                console.log('in provisional and this is map before', this.$store.map)
                return this.map;
            }
        },
        methods: {
            toggleProvisionalStatement() {
                this.isFullProvisionalStatementShowing = !this.isFullProvisionalStatementShowing;
            },
        }
    }
</script>

<style scoped lang="scss">
  .provisional-statement {
    font-size: 0.8em;
    margin: auto;
    padding: 0.2em;
    max-width: 70em;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    font-weight: 400;
    text-align: center;

    button {
      margin: 3px 0 0 10px;
      background: #003366;
      color: #ffffff;
      border: none;
      outline: none;
      padding: 2px 10px;
      border-radius: 5px;
      font-weight: bold;
    }

    .statement-condensed  {
       display: flex;
      span {
        margin: 5px;
        padding-bottom: 2px;
        flex: 5;
      }
    }

    .statement-expanded {
      margin: 0;
      p {
        margin: 5px;
      }

      button {
        margin: 0;
      }

    }
  }
</style>
