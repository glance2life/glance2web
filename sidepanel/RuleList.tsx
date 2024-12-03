import { Button, Drawer, List, message, Popconfirm, Typography } from "antd"
import { useState, type FC } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import type { Rule } from "~typings"

import RuleForm from "./RuleForm"

interface IProp {
  open: boolean
  setOpen: (v: boolean) => void
}

const RuleList: FC<IProp> = ({ open, setOpen }) => {
  const [showForm, setShowForm] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule>()
  const [rules, setRules] = useStorage<Rule[]>("rules", [])

  return (
    <>
      <Drawer
        title="Rules"
        placement="bottom"
        destroyOnClose
        extra={[
          <Button
            type="primary"
            onClick={() => {
              setEditingRule(undefined)
              setShowForm(true)
            }}>
            Create
          </Button>
        ]}
        open={open}
        onClose={() => setOpen(false)}
        height="90vh">
        <List
          itemLayout="horizontal"
          dataSource={rules}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={[
                <a
                  key="list-loadmore-edit"
                  onClick={() => {
                    setEditingRule(item)
                    setShowForm(true)
                  }}>
                  edit
                </a>,
                <Popconfirm
                  title="Confirm deletion?"
                  onConfirm={() => {
                    const newValue = rules.filter((rule) => rule.id !== item.id)
                    setRules(newValue)
                    message.success("done")
                  }}>
                  <a key="list-loadmore-more">delete</a>
                </Popconfirm>
              ]}>
              <List.Item.Meta
                title={item.name}
                description={
                  <Typography.Text code>
                    {item.match || "no match rule"}
                  </Typography.Text>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>
      <RuleForm
        data={editingRule}
        open={showForm}
        setOpen={setShowForm}
        rules={rules}
        setRules={setRules}
      />
    </>
  )
}

export default RuleList
