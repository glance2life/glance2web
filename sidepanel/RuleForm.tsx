import {
  Button,
  Divider,
  Drawer,
  Form,
  Input,
  message,
  Space,
  Spin
} from "antd"
import { nanoid } from "nanoid"
import { type FC } from "react"
import ReactJson from "react-json-view"

import type { Rule } from "~typings"

import { useActivatedTabUrl } from "./useActivatedTabUrl"
import { useExtract } from "./useExtract"

interface IProp {
  data?: Rule
  open: boolean
  setOpen: (v: boolean) => void
  rules: Rule[]
  setRules: (rules: Rule[]) => void
}

const RuleForm: FC<IProp> = ({ data, open, setOpen, rules, setRules }) => {
  const [form] = Form.useForm()
  const { loading, value, extract } = useExtract()

  const match = Form.useWatch("match", form)
  const activatedUrl = useActivatedTabUrl()

  const tryDisabled = (() => {
    try {
      return !new RegExp(match).test(activatedUrl)
    } catch {
      return false
    }
  })()

  return (
    <Drawer
      title={`${data ? "Edit" : "Create"} Rule`}
      placement="bottom"
      destroyOnClose
      afterOpenChange={(open) => {
        if (!open) {
          form.resetFields()
        }
      }}
      open={open}
      onClose={() => setOpen(false)}
      height="90vh"
      footer={
        <Space>
          <Button
            onClick={() => {
              form.validateFields().then((values) => {
                if (!data) {
                  setRules([
                    ...rules,
                    {
                      id: nanoid(),
                      ...values
                    } as Rule
                  ])
                } else {
                  const newValue = rules.map((rule) => {
                    if (rule.id !== data.id) {
                      return rule
                    }
                    return {
                      id: data.id,
                      ...values
                    }
                  })
                  setRules(newValue)
                }
                message.success("done")
                setOpen(false)
              })
            }}
            type="primary">
            Submit
          </Button>
          <Button
            onClick={() => {
              form.resetFields()
              setOpen(false)
            }}>
            Cancel
          </Button>
        </Space>
      }>
      <Form form={form} initialValues={data}>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="please input" />
        </Form.Item>
        <Form.Item
          label="URL RegExp"
          name="match"
          help="it will auto select this rule when current page url is matched"
          rules={[{ required: true }, { type: "regexp" }]}>
          <Input placeholder="please input regexp string" />
        </Form.Item>
        <Form.Item
          label="JSON Schema"
          name="schema"
          help={
            <span>
              You can create JSON Schema visually{" "}
              <a
                onClick={() => {
                  chrome.tabs.create({
                    url: "https://hellosean1025.github.io/json-schema-visual-editor/"
                  })
                }}>
                here
              </a>
            </span>
          }
          rules={[{ required: true }]}>
          <Input.TextArea rows={7} />
        </Form.Item>
        <Form.Item
          help={
            tryDisabled
              ? "The URL of the currently activated Tab does not match"
              : undefined
          }>
          <Button
            style={{ marginTop: 24 }}
            type="primary"
            block
            onClick={() => {
              form.validateFields().then((values) => {
                extract(values)
              })
            }}
            loading={loading}
            disabled={tryDisabled}>
            Try it
          </Button>
        </Form.Item>
        <Divider>Result</Divider>
        <Spin spinning={loading}>
          <ReactJson
            src={value}
            name={false}
            displayObjectSize={false}
            displayDataTypes={false}
            quotesOnKeys={false}
            // @ts-ignore
            displayArrayKey={false}
          />
        </Spin>
      </Form>
    </Drawer>
  )
}

export default RuleForm
