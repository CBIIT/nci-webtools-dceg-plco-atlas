const columns = ['#bin', 'name', 'chrom', 'strand', 'txStart', 'txEnd', 'cdsStart', 'cdsEnd', 'exonCount', 'exonStarts', 'exonEnds', 'score', 'name2', 'cdsStartStat', 'cdsEndStat', 'exonFrames'];

const mapToSchema = values => {
    const [bin, ensembl_name, chromosome, strand, transcription_start, transcription_end, cds_start, cds_end, exon_count, exon_starts, exon_ends, score, name, cds_start_stat, cds_end_stat, exon_frames] = values;
    return  {name, chromosome, strand, transcription_start, transcription_end, exon_starts, exon_ends};
}

const mapToSql = line => {
    const values = line.split(/\s+/g);
    let [bin, ensembl_name, chromosome, strand, transcription_start, transcription_end, cds_start, cds_end, exon_count, exon_starts, exon_ends, score, name, cds_start_stat, cds_end_stat, exon_frames] = values;
    chromosome = +chromosome.replace(/chr/, '');
    chromosome = isNaN(chromosome) ? null : chromosome;
    return Buffer.from([name, chromosome, strand, transcription_start, transcription_end, exon_starts, exon_ends]
        .map(e => e === null ? null : `"${e}"`).join(',') + '\n');
}


module.exports = {columns, mapToSchema, mapToSql};
