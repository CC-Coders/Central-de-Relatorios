function defineStructure() {

}
function onSync(lastSyncDate) {

}
function createDataset(fields, constraints, sortFields) {
    log.info("Executa Relatorio");

    var pXML, pCodColigada, pIdFormula = null;
    if (constraints == null) {
        return erro("Sem parametros");
    } else {
        for (i = 0; i < constraints.length; i++) {
            if (constraints[i].fieldName == "pXML") {
                pXML = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == "pCodColigada") {
                pCodColigada = constraints[i].initialValue;
            }
            else if (constraints[i].fieldName == "pIdFormula") {
                pIdFormula = constraints[i].initialValue;
            }
        }
    }
    if (pXML != null && pCodColigada != null && pIdFormula != null) {
        log.info("XML executa relatorio: " + pXML);
        log.info("pCodColigada executa relatorio: " + pCodColigada);
        log.info("pIdFormula executa relatorio: " + pIdFormula);


        var service = ServiceManager.getService("wsFormulaVisual");
        var serviceHelper = service.getBean();
        var serviceLocator = service.instantiate("com.totvs.WsFormulaVisual");
        var wsObj = serviceLocator.getRMIwsFormulaVisual();
    
        var authService = serviceHelper.getBasicAuthenticatedClient(wsObj, "com.totvs.IwsFormulaVisual", "fluig", "flu!g@cc#2018");
        var ret = authService.execute(pCodColigada, pIdFormula, "CODCOLIGADA="+pCodColigada, "", pXML, "");
        log.info("Retorno wsFormulaVisual: " + ret);
        return ret;
    }else{
        return "Parametros invalidos!";
    }


  
} function onMobileSync(user) {

}