<div id="CentralRelatorios1_${instanceId}" class="fluig-style-guide wcm-widget-class super-widget" data-params="CentralRelatorios1.instance()">
    <script type="text/javascript" src="/webdesk/vcXMLRPC.js"></script>
	<h2 class="titulo2">Central de Relatórios</h2>
    <label for="selectRelatorio">Selecione o relatório desejado:</label>
    <div style="display: flex">
        <select name="selectRelatorio" id="selectRelatorio" class="form-control">
            <option value=""></option>            
        </select>
    </div>
    <div id="divDespesasFinanceiro">
        <br />
        <div class="panel panel-primary">
            <div class="panel-heading">
                <h3 class="panel-title">Filtros</h3>
            </div>
            <div class="panel-body">
                <div class="row">
                    <div class="col-md-4">
                        <label for="selectCCUSTO">Selecione o centro de custo:</label>
                        <select name="selectCCUSTO" id="selectCCUSTO" class="form-control"></select>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div id="divCompromissosCadastrados">
        <br />
        <div class="panel panel-primary">
            <div class="panel-heading">
                <h3 class="panel-title">Filtros</h3>
            </div>
            <div class="panel-body">
                <div class="row">
                    <div class="col-md-2 col-xs-12" style="margin-bottom: 10px">
                        <label for="dataInicioCompromissosCadastrados">Data Início:</label>
                        <input type="text" name="dataInicioCompromissosCadastrados" id="dataInicioCompromissosCadastrados" class="form-control" />
                    </div>
                    <div class="col-md-2 col-xs-12" style="margin-bottom: 10px">
                        <label for="dataFimCompromissosCadastrados">Data Fim:</label>
                        <input type="text" name="dataFimCompromissosCadastrados" id="dataFimCompromissosCadastrados" class="form-control" />
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <br />        
        <div class="col-md-12" style="text-align: center">
            <button class="btn btn-primary btnGerar">Gerar Relatório</button>
        </div>
    </div>
</div>
