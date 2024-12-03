import { UnorderedListOutlined } from "@ant-design/icons"
import {
  Button,
  Card,
  Divider,
  Flex,
  Form,
  Select,
  Spin,
  Typography
} from "antd"
import { useEffect, useState } from "react"
import ReactJson from "react-json-view"

import { useStorage } from "@plasmohq/storage/hook"

import type { Rule } from "~typings"

import "./global.less"

import RuleList from "./RuleList"
import { useActivatedTabUrl } from "./useActivatedTabUrl"
import { useExtract } from "./useExtract"

const App = () => {
  const [open, setOpen] = useState(false)
  const [rules] = useStorage<Rule[]>("rules", [])
  const [selectedRuleId, setSelectedRuleId] = useState<string>()
  const selectedRule = rules.find((item) => item.id === selectedRuleId)

  const { loading, value, extract } = useExtract()

  const [options, setOptions] = useState<{ label: string; value: string }[]>()
  const activatedUrl = useActivatedTabUrl()
  useEffect(() => {
    // auto select rule
    const matches = rules.filter((rule) => {
      return new RegExp(rule.match).test(activatedUrl)
    })

    if (matches.length) {
      setOptions(
        matches.map((item) => ({
          label: item.name,
          value: item.id
        }))
      )
      setSelectedRuleId(matches[0].id)
    } else {
      setSelectedRuleId(undefined)
      setOptions([])
    }
  }, [activatedUrl])

  return (
    <Flex vertical justify="start">
      <Flex
        justify="space-between"
        align="center"
        style={{
          padding: "0 12px",
          height: 42,
          marginBottom: 8,
          background: "#fff"
        }}>
        <Typography.Title
          level={5}
          style={{ padding: 0, margin: 0, userSelect: "none" }}>
          👀 Glance2Web
        </Typography.Title>
        <Button
          icon={<UnorderedListOutlined />}
          type="link"
          onClick={() => {
            setOpen(true)
          }}>
          Rules
        </Button>
      </Flex>
      <Flex vertical justify="start" style={{ padding: "0px 12px" }}>
        <Card
          style={{
            backgroundColor: "#f6ffed",
            color: "#fff",
            border: "1px solid #b7eb8f"
          }}>
          <Form.Item label="Rule">
            <Select
              value={selectedRuleId}
              placeholder="Select a rule"
              onChange={(v) => {
                setSelectedRuleId(v)
              }}
              options={options}
              notFoundContent="no match rule"
            />
          </Form.Item>
          <Button
            block
            type="primary"
            disabled={!selectedRuleId}
            onClick={() => {
              extract(selectedRule)
            }}
            loading={loading}>
            Extract Data
          </Button>
        </Card>
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
        <RuleList open={open} setOpen={setOpen} />
      </Flex>
    </Flex>
  )
}

export default App
