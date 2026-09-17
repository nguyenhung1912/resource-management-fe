import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../Card';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '../Table';

describe('Card component', () => {
  it('render đầy đủ cấu trúc Card, Header, Title, Description, Content và Footer', () => {
    render(
      <Card data-testid="test-card">
        <CardHeader>
          <CardTitle>Tiêu đề thẻ</CardTitle>
          <CardDescription>Mô tả chi tiết nội dung</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Nội dung chính của thẻ</p>
        </CardContent>
        <CardFooter>
          <button type="button">Hành động</button>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByTestId('test-card')).toHaveClass('rounded-xl', 'border-border-subtle', 'bg-surface');
    expect(screen.getByText('Tiêu đề thẻ')).toBeInTheDocument();
    expect(screen.getByText('Mô tả chi tiết nội dung')).toHaveClass('text-text-muted');
    expect(screen.getByText('Nội dung chính của thẻ')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hành động' })).toBeInTheDocument();
  });
});

describe('Table component', () => {
  it('render đầy đủ cấu trúc Table với Header, Body, Row, Head, Cell và Caption', () => {
    render(
      <Table>
        <TableCaption>Bảng danh sách mẫu</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Mã số</TableHead>
            <TableHead>Tên tài liệu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>DOC-001</TableCell>
            <TableCell>Tài liệu A</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Tổng cộng: 1</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Bảng danh sách mẫu')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Mã số' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'DOC-001' })).toBeInTheDocument();
    expect(screen.getByText('Tổng cộng: 1')).toBeInTheDocument();
  });
});
