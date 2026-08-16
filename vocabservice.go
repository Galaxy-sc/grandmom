package main

import (
	"bytes"
	"path/filepath"
	"runtime"
	"sort"
	"sync"

	"github.com/ledongthuc/pdf"
	"github.com/ncruces/zenity"
)

type WordFreq struct {
	Word  string `json:"word"`
	Count int    `json:"count"`
}

type ProcessResult struct {
	FileName string     `json:"fileName"`
	Words    []WordFreq `json:"words"`
}

type VocabService struct{}

func processChunk(data []byte) map[string]int {
	freqMap := make(map[string]int, 2048)
	wordBuf := make([]byte, 0, 64)

	for _, char := range data {
		if char >= 'A' && char <= 'Z' {
			wordBuf = append(wordBuf, char+32)
		} else if char >= 'a' && char <= 'z' {
			wordBuf = append(wordBuf, char)
		} else {
			if len(wordBuf) > 2 {
				freqMap[string(wordBuf)]++
			}
			wordBuf = wordBuf[:0]
		}
	}

	if len(wordBuf) > 2 {
		freqMap[string(wordBuf)]++
	}
	return freqMap
}

func (v *VocabService) SelectAndProcessPDF() (*ProcessResult, error) {
	filePath, err := zenity.SelectFile(
		zenity.Title("Select a PDF Book"),
		zenity.FileFilters{
			{Name: "PDF Files", Patterns: []string{"*.pdf"}},
		},
	)

	if err != nil || filePath == "" {
		return nil, nil
	}

	fileName := filepath.Base(filePath)

	f, r, err := pdf.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	b, err := r.GetPlainText()
	if err != nil {
		return nil, err
	}

	var buf bytes.Buffer
	buf.ReadFrom(b)
	rawBytes := buf.Bytes()

	if len(rawBytes) == 0 {
		return &ProcessResult{
			FileName: fileName,
			Words:    []WordFreq{},
		}, nil
	}

	numWorkers := runtime.NumCPU()
	chunkSize := len(rawBytes) / numWorkers

	var wg sync.WaitGroup
	var mu sync.Mutex
	var maps []map[string]int

	start := 0
	for i := 0; i < numWorkers; i++ {
		end := start + chunkSize
		if i == numWorkers-1 {
			end = len(rawBytes)
		} else {
			for end < len(rawBytes) && ((rawBytes[end] >= 'A' && rawBytes[end] <= 'Z') || (rawBytes[end] >= 'a' && rawBytes[end] <= 'z')) {
				end++
			}
		}

		if start >= len(rawBytes) {
			break
		}

		chunk := rawBytes[start:end]
		wg.Add(1)
		
		go func(c []byte) {
			defer wg.Done()
			localMap := processChunk(c)
			
			mu.Lock()
			maps = append(maps, localMap)
			mu.Unlock()
		}(chunk)

		start = end
	}

	wg.Wait()

	finalMap := make(map[string]int, 16384)
	for _, m := range maps {
		for k, v := range m {
			finalMap[k] += v
		}
	}

	sortedWords := make([]WordFreq, 0, len(finalMap))
	for word, count := range finalMap {
		sortedWords = append(sortedWords, WordFreq{Word: word, Count: count})
	}

	sort.Slice(sortedWords, func(i, j int) bool {
		return sortedWords[i].Count > sortedWords[j].Count
	})
	

	return &ProcessResult{
		FileName: fileName,
		Words:    sortedWords,
	}, nil
}