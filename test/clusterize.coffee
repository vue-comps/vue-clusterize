env = null
cl = null
clel = null
overallHeight = null
describe "clusterize", ->


  describe "basic env", ->

    before ->
      env = loadComp(require("../dev/basic.vue"))
      cl = env.$refs.clusterize

    after ->
      unloadComp(env)

    it "should render clusterize", ->
      should.exist(cl)
      should.exist(cl.$el)
      clel = cl.$el

    it "should have class clusterize", ->
      clel.should.have.class "clusterize"

    it "should have element clusterize-first-row and last-row", ->
      clel.should.contain "div.clusterize-first-row"
      clel.should.contain "div.clusterize-last-row"


    it "should contain three clusters", ->
      clel.querySelectorAll("div.clusterize-cluster").should.have.length(3)

    it "should emit event clusterize-loaded", (done) ->
      cl.$once "clusterize-loaded", done


    describe "after loaded", ->


      describe "clusterize-first-row", ->

        it "should have a height of 0", ->
          clfrel = clel.querySelector "div.clusterize-first-row"
          clfrel.should.exist
          clfrel.should.have.attr("style","height: 0px;")


      describe "clusterize-last-row", ->

        it "should have a height", ->
          cllrel = clel.querySelector "div.clusterize-last-row"
          cllrel.should.exist
          overallHeight = cl.rowHeight * 10000
          cllrel.should.have.attr("style","height: #{overallHeight-3*cl.clusterSize*cl.rowHeight}px;")


      describe "the clusters", ->
        clsels = null

        it "should have a height", ->
          clsels = clel.querySelectorAll("div.clusterize-cluster")
          for clusterel in clsels
            clusterel.should.have.attr("style").match(new RegExp("height: #{cl.clusterSize*cl.rowHeight}px;"))

        it "should have cl.clusterSize rows", ->
          for clusterel in clsels
            clusterel.querySelectorAll("div.clusterize-row").should.have.length(cl.clusterSize)

        it "should have the right data", ->
          i = 1
          for clusterel in clsels
            rowels = clusterel.querySelectorAll("div.clusterize-row")
            for row in rowels
              row.should.have.text i+''
              i++

        it "should have a hidden loading item", ->
          for clusterel in clsels
            lel = clusterel.querySelector("div.clusterize-cluster-loading[style='display: none;']")
            lel.should.exit
            lel.should.contain "p[slot='loading']"
            lel.should.have.text "loading"


    describe "scrolling", ->

      it "should scroll up 3/2 clustersize without change",  ->
        cl.scrollTop = Math.floor(3/2*cl.clusterHeight-1)
        clel.querySelector("div.clusterize-first-row").should.have.attr("style","height: 0px;")
        i = 1
        for clusterel in clel.querySelectorAll("div.clusterize-cluster")
          rowels = clusterel.querySelectorAll("div.clusterize-row")
          for row in rowels
            row.should.have.text i+''
            i++

      it "should transit at scroll top 918", (done) ->
        cl.$once "cluster-loading", (nr) ->
          nr.should.equal 3
        cl.scrollTop = Math.floor(3/2*cl.clusterHeight)
        cl.$nextTick ->
          clel.querySelector("div.clusterize-first-row").should.have.attr("style","height: #{cl.clusterSize*cl.rowHeight}px;")
          clel.querySelector("div.clusterize-last-row").should.have.attr("style","height: #{overallHeight-4*cl.clusterSize*cl.rowHeight}px;")
          i = cl.clusterSize+1
          for clusterel in clel.querySelectorAll("div.clusterize-cluster")
            rowels = clusterel.querySelectorAll("div.clusterize-row")
            for row in rowels
              row.should.have.text i+''
              i++
          cl.scrollTop = 0
          cl.$nextTick done


    describe "size change", ->

      it "should change clustersize on size change", (done) ->
        cl.height = 200
        cl.$nextTick ->
          clsels = clel.querySelectorAll("div.clusterize-cluster")
          clel.querySelector("div.clusterize-last-row").should.have.attr("style")
          .match(new RegExp("height: #{overallHeight-3*cl.clusterSize*cl.rowHeight}px;"))
          i = 1
          for clusterel in clsels
            clusterel.should.have.attr("style").match(new RegExp("height: #{cl.clusterSize*cl.rowHeight}px;"))
            rowels = clusterel.querySelectorAll("div.clusterize-row")
            rowels.should.have.length(cl.clusterSize)
            for row in rowels
              row.should.have.text i+''
              i++
          done()

  describe "loading env", ->

    before ->
      env = loadComp(require("../dev/loading.vue"))
      cl = env.$refs.clusterize
      should.exist(cl)
      should.exist(cl.$el)
      clel = cl.$el

    after ->
      unloadComp(env)

    it "should dispatch event clusterize-loaded", (done) ->
      cl.$once "clusterize-loaded", done

    it "should be loading",  ->
      clsels = clel.querySelectorAll("div.clusterize-cluster")
      for clusterel in clsels
        clusterel.should.contain "div.clusterize-cluster-loading>p[slot='loading']"
        clusterel.should.have.attr("style").match(new RegExp("height: #{cl.clusterSize*cl.rowHeight}px;"))

    it "should contain data once loaded", (done) ->
      clsels = clel.querySelectorAll("div.clusterize-cluster")
      j = 0
      cl.$on "cluster-loaded", (nr) ->
        clel.querySelector("div.clusterize-last-row").should.have.attr("style").match(new RegExp("height: #{overallHeight-3*cl.clusterSize*cl.rowHeight}px;"))
        env.$nextTick ->
          i = 1+nr*cl.clusterSize
          rowels = clsels[nr].querySelectorAll("div.clusterize-row")
          rowels.should.have.length(cl.clusterSize)
          for row in rowels
            row.should.have.text i+''
            i++
          j++
          done() if j == 3
