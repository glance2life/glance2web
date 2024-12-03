import { sendToBackground } from "@plasmohq/messaging"
import { message } from "antd"
import { useAsyncFn } from "react-use"
import type { Rule } from "~typings"

export function useExtract() {
  const [{ loading, value }, extract] = useAsyncFn(async (selectedRule: Rule) => {
    const res = await sendToBackground({
      name: "extract",
      body: {
        rule: selectedRule
      }
    })

    const { data, success, errorMessage } = res

    if (success) {
      message.success("done")
      return JSON.parse(data)
    } else {
      message.error("something error")
      console.error(errorMessage)
      return undefined
    }
  })

  return {loading, value, extract};
}
