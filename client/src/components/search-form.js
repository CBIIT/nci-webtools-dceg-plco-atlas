import React from 'react';
import {
    Form,
    Card,
    Nav,
    Tab,
    Button,
    InputGroup,
    FormControl
  } from 'react-bootstrap';

export function SearchForm({params, traits, onSubmit}) {
    return (
        <Form>
        <Form.Group controlId="trait-search" className="mb-4">
          <Form.Label>
            <b>Trait Search</b>
          </Form.Label>
          <InputGroup>
            <FormControl placeholder="Enter Trait" />
            <InputGroup.Append>
              <Button variant="primary">Search</Button>
            </InputGroup.Append>
          </InputGroup>
        </Form.Group>

        <Form.Group controlId="trait-list">
          <Form.Label>
            <b>Trait List</b>
          </Form.Label>
          <InputGroup>
            <InputGroup.Prepend>
              <Form.Control as="select">
                <option>Categorical</option>
                <option>Alphabetic</option>
              </Form.Control>
            </InputGroup.Prepend>
            <Form.Control as="select">
              <option hidden>Select a trait</option>
              <optgroup label="Group A">
                <option>Sample Trait A1</option>
                <option>Sample Trait A2</option>
              </optgroup>
              <optgroup label="Group B">
                <option>Sample Trait B1</option>
                <option>Sample Trait B2</option>
              </optgroup>
            </Form.Control>
            <InputGroup.Append>
              <Button variant="primary">Go</Button>
            </InputGroup.Append>
          </InputGroup>
        </Form.Group>
      </Form>
)
}