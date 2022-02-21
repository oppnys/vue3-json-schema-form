import { defineComponent, Ref, ref } from 'vue'
import MonacoEditor from './components/MonacoEditor'
import { toJsonStr } from './utils'

import { createUseStyles } from 'vue-jss'

const useStyles = createUseStyles({
  wrapper: {
    minHeight: 400,
  },
})

const schema = {
  name: 'oppnys',
}

export default defineComponent({
  setup() {
    const schemaRef: Ref = ref(schema)

    const handleCodeChange = (code: string) => {
      let schema = null
      try {
        schema = JSON.parse(code)
      } catch (e) {
        console.log(e)
      }
      schemaRef.value = schema
    }
    const useClassesRefs = useStyles()
    return () => {
      const classes = useClassesRefs.value

      const code = toJsonStr(schemaRef.value)
      return (
        <div>
          <MonacoEditor
            class={classes.wrapper}
            code={code}
            title="Schema"
            onChange={handleCodeChange}
          ></MonacoEditor>
        </div>
      )
    }
  },
})
