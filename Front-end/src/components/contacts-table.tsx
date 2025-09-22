import React, { useState, useMemo } from 'react';
import './contacts-table.css';

interface ContactsTableProps {
  contacts: Array<{
    ContactID: string;
    Name: string;
    EmailAddress?: string;
    FirstName?: string;
    LastName?: string;
    ContactStatus: string;
  }>;
}

const ContactsTable = ({ contacts }: ContactsTableProps): JSX.Element => {
  const [sortField, setSortField] = useState('Name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleSort = (field: string): void => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedContacts = useMemo(() => {
    let filtered = [...contacts];

    // Apply status filter
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(contact => contact.ContactStatus === filterStatus);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.Name?.toLowerCase().includes(searchLower) ||
        contact.EmailAddress?.toLowerCase().includes(searchLower) ||
        contact.FirstName?.toLowerCase().includes(searchLower) ||
        contact.LastName?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === 'string') {
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [contacts, sortField, sortDirection, filterStatus, searchTerm]);

  const totalItems = filteredAndSortedContacts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContacts = filteredAndSortedContacts.slice(startIndex, endIndex);

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number): void => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  const getSortIndicator = (field: string): string => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const formatStatus = (status: string): JSX.Element => {
    const className = status === 'ACTIVE' ? 'status-badge status-active' : 'status-badge status-inactive';
    return <span className={className}>{status}</span>;
  };

  return (
    <div>
      <div className="filters-container">
        <div>
          <label htmlFor="search" className="filter-label">
            Search:
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
        </div>

        <div>
          <label htmlFor="statusFilter" className="filter-label">
            Status:
          </label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div>
          <label htmlFor="itemsPerPage" className="filter-label">
            Items per page:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="filter-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="items-info">
          Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} contacts
          {totalItems !== contacts.length && ` (filtered from ${contacts.length})`}
        </div>
      </div>

      {/* Contacts Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th 
                onClick={() => handleSort('Name')}
                className="sortable-header"
              >
                Name{getSortIndicator('Name')}
              </th>
              <th 
                onClick={() => handleSort('EmailAddress')}
                className="sortable-header"
              >
                Email{getSortIndicator('EmailAddress')}
              </th>
              <th 
                onClick={() => handleSort('FirstName')}
                className="sortable-header"
              >
                First Name{getSortIndicator('FirstName')}
              </th>
              <th 
                onClick={() => handleSort('LastName')}
                className="sortable-header"
              >
                Last Name{getSortIndicator('LastName')}
              </th>
              <th 
                onClick={() => handleSort('ContactStatus')}
                className="sortable-header"
              >
                Status{getSortIndicator('ContactStatus')}
              </th>
              <th>Contact ID</th>
            </tr>
          </thead>
          <tbody>
            {paginatedContacts.map((contact) => (
              <tr key={contact.ContactID}>
                <td className="contact-name">
                  {contact.Name || 'N/A'}
                </td>
                <td>
                  {contact.EmailAddress ? (
                    <a 
                      href={`mailto:${contact.EmailAddress}`}
                      className="contact-email"
                    >
                      {contact.EmailAddress}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>{contact.FirstName || 'N/A'}</td>
                <td>{contact.LastName || 'N/A'}</td>
                <td>{formatStatus(contact.ContactStatus)}</td>
                <td className="contact-id">
                  {contact.ContactID}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedContacts.length === 0 && totalItems > 0 && (
          <div className="empty-message">
            No contacts on this page.
          </div>
        )}

        {totalItems === 0 && (
          <div className="empty-message">
            No contacts match your current filters.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
          >
            First
          </button>

          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
          >
            Previous
          </button>

          {/* Page Numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber: number;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`pagination-button ${currentPage === pageNumber ? 'active' : ''}`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
          >
            Next
          </button>

          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
          >
            Last
          </button>

          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsTable;
