import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ActionLogList.css';
import { Table, Tag, Select, DatePicker, Button, Card, Spin, message, Space, Input } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    message.error(error.response?.data?.message || 'Server error');
    return Promise.reject(error);
  }
);

const ActionLogList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    auditType: undefined,
    auditStatus: undefined,
    action: undefined,
    dateRange: undefined,
  });

  const actionValues = ['CREATE', 'UPDATE', 'DELETE'];
  const statusValues = ['Completed', 'Ongoing', 'Pending'];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { current, pageSize } = pagination;
      const params = {
        page: current,
        limit: pageSize,
        ...(filters.auditType && { type: filters.auditType }),
        ...(filters.auditStatus && { status: filters.auditStatus }),
        ...(filters.action && { action: filters.action }),
        populate: 'auditID',
      };

      if (filters.dateRange?.length === 2) {
        params.startDate = dayjs(filters.dateRange[0]).startOf('day').toISOString();
        params.endDate = dayjs(filters.dateRange[1]).endOf('day').toISOString();
      }

      const response = await api.get('/action-logs', { params });
      const data = response.data.data?.map((log) => ({
        ...log,
        key: log._id,
        displayStatus: log.auditID?.status ?? log.status ?? '-',
        displayType: log.auditID?.type ?? log.type ?? 'Not specified',
      })) || [];

      setLogs(data);
      setPagination((prev) => ({ ...prev, total: response.data.total || data.length }));
    } catch (error) {
      console.error('Error loading logs:', error);
      message.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.current, pagination.pageSize]);

  const handleTableChange = (newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      auditType: undefined,
      auditStatus: undefined,
      action: undefined,
      dateRange: undefined,
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const getTypeColor = (type) => {
    const colors = {
      Audit: 'blue',
      Inspection: 'green',
      Control: 'orange',
    };
    return colors[type] || 'purple';
  };

  const getStatusColor = (status) => {
    const colors = {
      Completed: 'green',
      Ongoing: 'blue',
      Pending: 'orange',
    };
    return colors[status] || 'gray';
  };

  const getActionColor = (action) => {
    const colors = {
      CREATE: 'green',
      UPDATE: 'blue',
      DELETE: 'red',
    };
    return colors[action] || 'gray';
  };

  const columns = [
    {
      title: 'Audit Type',
      dataIndex: 'displayType',
      key: 'type',
      render: (type) => <Tag color={getTypeColor(type)}>{type}</Tag>,
      sorter: (a, b) => (a.displayType || '').localeCompare(b.displayType || ''),
    },
    {
      title: 'Audit Status',
      dataIndex: 'displayStatus',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
      sorter: (a, b) => (a.displayStatus || '').localeCompare(b.displayStatus || ''),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => <Tag color={getActionColor(action)}>{action}</Tag>,
      sorter: (a, b) => (a.action || '').localeCompare(b.action || ''),
    },
    {
      title: 'Element ID',
      dataIndex: 'elementId',
      key: 'elementId',
      render: (id) => <span className="text-mono">{id}</span>,
    },
    {
      title: 'Date/Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
  ];

  return (
    <div className="action-log-container">
      <Card
        title="Action Log"
        extra={
          <Button icon={<ReloadOutlined />} onClick={resetFilters} loading={loading}>
            Reset
          </Button>
        }
      >
        <div className="filter-section">
          <Space size="middle" wrap>
            <div className="filter-group">
              <label>Audit Type</label>
              <Input
                placeholder="Type audit type"
                value={filters.auditType || ''}
                onChange={(e) => handleFilterChange('auditType', e.target.value)}
                allowClear
                style={{ width: 150 }}
              />
            </div>

            <div className="filter-group">
              <label>Status</label>
              <Select
                placeholder="All statuses"
                value={filters.auditStatus}
                onChange={(v) => handleFilterChange('auditStatus', v)}
                allowClear
                style={{ width: 150 }}
              >
                {statusValues.map((status) => (
                  <Option key={status} value={status}>
                    {status}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="filter-group">
              <label>Action</label>
              <Select
                placeholder="All actions"
                value={filters.action}
                onChange={(v) => handleFilterChange('action', v)}
                allowClear
                style={{ width: 150 }}
              >
                {actionValues.map((action) => (
                  <Option key={action} value={action}>
                    {action}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="filter-group date-filter">
              <label>Period</label>
              <RangePicker
                showTime={{ format: 'HH:mm' }}
                format="DD/MM/YYYY HH:mm"
                onChange={(dates) => handleFilterChange('dateRange', dates)}
                value={filters.dateRange}
                style={{ width: 350 }}
              />
            </div>

            <Button type="primary" onClick={fetchLogs} loading={loading}>
              Apply
            </Button>
          </Space>
        </div>

        <Spin spinning={loading} tip="Loading...">
          <Table
            columns={columns}
            dataSource={logs}
            rowKey="key"
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `Total ${total} logs`,
            }}
            onChange={handleTableChange}
            scroll={{ x: true }}
            locale={{
              emptyText: 'No logs available',
            }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default ActionLogList;