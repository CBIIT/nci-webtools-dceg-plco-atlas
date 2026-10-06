import fs from 'fs';
import path from 'path';
import '@testing-library/jest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import Footer, {
  getFooterMetadata,
  parseDeploymentDate,
  parseVersion
} from './footer';

describe('footer metadata', () => {
  afterEach(() => {
    delete process.env.REACT_APP_VERSION;
    delete process.env.REACT_APP_DEPLOYMENT_DATE;
  });

  it('preserves release and development version formats', () => {
    expect(parseVersion('GWASExplorer_2.2.3_20260904')).toBe('2.2.3');
    expect(parseVersion('GWASExplorer_2.2.3_dev_20260904')).toBe('2.2.3_dev');
    expect(parseVersion('dev_9944')).toBe('dev');
    expect(parseVersion()).toBe('dev');
  });

  it('uses only an explicit ISO deployment date', () => {
    expect(parseDeploymentDate('2026-10-06')).toBe('2026-10-06');
    expect(parseDeploymentDate('20261006')).toBe('Unknown');
    expect(parseDeploymentDate()).toBe('Unknown');
  });

  it('returns separate version and deployment date values', () => {
    expect(
      getFooterMetadata('GWASExplorer_2.2.3_20260904', '2026-10-06')
    ).toEqual({
      version: '2.2.3',
      date: '2026-10-06'
    });
  });

  it('renders explicit build metadata', () => {
    process.env.REACT_APP_VERSION = 'GWASExplorer_2.2.3_20260904';
    process.env.REACT_APP_DEPLOYMENT_DATE = '2026-10-06';

    render(<Footer />);

    expect(screen.getByText('Version: 2.2.3')).toBeVisible();
    expect(screen.getByText('Last Updated: 2026-10-06')).toBeVisible();
  });

  it('renders a stable fallback when deployment date is unavailable', () => {
    process.env.REACT_APP_VERSION = 'dev';
    delete process.env.REACT_APP_DEPLOYMENT_DATE;

    render(<Footer />);

    expect(screen.getByText('Version: dev')).toBeVisible();
    expect(screen.getByText('Last Updated: Unknown')).toBeVisible();
  });
});

describe('footer build configuration', () => {
  const repositoryRoot = path.resolve(process.cwd(), '..');

  it('passes version and deployment date through the frontend image', () => {
    const dockerfile = fs.readFileSync(
      path.join(repositoryRoot, 'docker/frontend.dockerfile'),
      'utf8'
    );

    expect(dockerfile).toContain('ARG REACT_APP_VERSION=docker');
    expect(dockerfile).toContain('ENV REACT_APP_VERSION=${REACT_APP_VERSION}');
    expect(dockerfile).toContain('ARG REACT_APP_DEPLOYMENT_DATE=Unknown');
    expect(dockerfile).toContain(
      'ENV REACT_APP_DEPLOYMENT_DATE=${REACT_APP_DEPLOYMENT_DATE}'
    );
  });

  it('sets and passes the deployment date in the deploy workflow', () => {
    const workflow = fs.readFileSync(
      path.join(repositoryRoot, '.github/workflows/deploy.yml'),
      'utf8'
    );

    expect(workflow).toContain('DEPLOYMENT_DATE=$(date +"%Y-%m-%d")');
    expect(workflow).toContain('REACT_APP_VERSION=${{ github.ref_name }}');
    expect(workflow).toContain(
      'REACT_APP_DEPLOYMENT_DATE=${{ env.DEPLOYMENT_DATE }}'
    );
  });
});
