import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  shallowRef,
  watch,
} from 'vue'
import { createUseStyles } from 'vue-jss'
import * as Monaco from 'monaco-editor'

const useStyles = createUseStyles({
  container: {
    border: `1px solid #eee`,
    display: `flex`,
    flexDirection: `column`,
    borderRadius: `5px`,
  },
  title: {
    backgroundColor: `#eee`,
    padding: `10px 0`,
    paddingLeft: 20,
  },
  code: {
    flexGrow: 1,
  },
})

export default defineComponent({
  props: {
    code: {
      type: String as PropType<string>,
      required: true,
    },
    title: {
      type: String as PropType<string>,
      required: true,
    },
    onChange: {
      type: Function as PropType<
        (value: string, event?: Monaco.editor.IModelContentChangedEvent) => void
      >,
      required: true,
    },
  },

  setup(props) {
    // must be shallowRef, if not, editor.getValue() won't work
    const editorRef = shallowRef()

    const classesRefs = useStyles()
    const containerRef = ref()

    let _subscription: Monaco.IDisposable | undefined
    let __prce = false

    onMounted(() => {
      const editor = (editorRef.value = Monaco.editor.create(
        containerRef.value,
        {
          value: props.code,
          language: 'json',
          formatOnPaste: true,
          tabSize: 2,
          minimap: {
            enabled: false,
          },
        },
      ))

      console.log(editor)
      _subscription = editor.onDidChangeModelContent(event => {
        console.log(`======> ${__prce}`)
        if (!__prce) {
          props.onChange(editor.getValue(), event)
        }
      })
    })

    onBeforeUnmount(() => {
      if (_subscription) _subscription.dispose()
    })

    watch(
      () => props.code,
      v => {
        const editor = editorRef.value
        const model = editor.getModel()
        if (v !== model.getValue()) {
          editor.pushUndoStop()
          __prce = true
          // pushEditOperations says it expects a cursorComputer, but doesn't seem to need one.
          model.pushEditOperations(
            [],
            [
              {
                range: model.getFullModelRange(),
                text: v,
              },
            ],
          )
          editor.pushUndoStop()
          __prce = false
        }
        // if (v !== editorRef.value.getValue()) {
        //   editorRef.value.setValue(v)
        // }
      },
    )

    return () => {
      const classes = classesRefs.value

      return (
        <div class={classes.container}>
          <div class={classes.title}>
            <span>{props.title}</span>
          </div>
          <div class={classes.code} ref={containerRef}></div>
        </div>
      )
    }
  },
})
