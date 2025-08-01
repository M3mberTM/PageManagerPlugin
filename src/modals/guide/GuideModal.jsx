import React from "react";
import "../../CommonStyles.css";
import Explanation from "../../components/typography/Explanation";
import Strong from "../../components/typography/Strong";
import Table from "../../components/typography/Table";
import TableRow from "../../components/typography/TableRow";
import TableHeading from "../../components/typography/TableHeading";
import TableColumn from "../../components/typography/TableColumn";

export const GuideModal = ({dialog}) => {

    return (
        <div style={{width: "600px", height: "800px", overflowY: 'scroll'}}>
            <div style={{width: '90%', margin: 'auto'}}>
                <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <sp-heading style={{marginTop: 0}} size={'L'}>Simple guide for Template making</sp-heading>
                    <sp-divider style={{backgroundColor: 'white', marginTop: '5px', marginBottom: '10px'}}></sp-divider>
                    <sp-body>
                        Templates are text, which contain special "text" that allows you to have different results based on specific files.<br/>
                        <br/>
                        This means that you don't have to name each file separately if you want to stay organized. Instead, you can make one template, and it will
                        automatically create a name for each file based on it's characteristics. One such example could be page numbers. Page numbers are different
                        from file to file. Normally you would have to write each page number for each file. With templates, you write it ONCE!!!<br/>
                        <br/>
                        <Strong>Interested? Well, here is a guide on how to.</Strong>
                    </sp-body>
                    <sp-heading size={'M'}>Explanation</sp-heading>
                    <sp-body>
                        Unlike normal naming, templates use <Strong>Variables.</Strong> Variables are special text, which changes from file to file. They are surrounded
                        by % symbols. These variables are replaced by another piece of text when they are used later. An example of template with variables is provided
                        below:
                        <Explanation>Sword_demon_p%a3% => Sword_demon_p001</Explanation>
                        In this case, we are using the <Strong>Leading zeros page number.</Strong>It means that it will add zeros to the beginning of the page number,
                        until the length of the page number is equal to the number 3 in this case. There are multiple different variables you can use. We will discuss
                        them in the next section.
                    </sp-body>
                    <sp-heading size={'M'}>Documentation</sp-heading>
                    <Table>
                        <TableRow>
                            <TableHeading>Command</TableHeading>
                            <TableHeading>Usage</TableHeading>
                            <TableHeading>Explanation</TableHeading>
                        </TableRow>
                        <TableRow>
                            <TableColumn>og</TableColumn>
                            <TableColumn>%og%</TableColumn>
                            <TableColumn>Original file name</TableColumn>
                        </TableRow>
                        <TableRow>
                            <TableColumn>num</TableColumn>
                            <TableColumn>%num%</TableColumn>
                            <TableColumn>Current page number</TableColumn>
                        </TableRow>
                        <TableRow>
                            <TableColumn>an</TableColumn>
                            <TableColumn>%a3%</TableColumn>
                            <TableColumn>Current page number, prepended by zeros until the length of the number equals the number inputted</TableColumn>
                        </TableRow>
                    </Table>
                </div>
            </div>
            <br/>
            <div class={"right-div-align"}>
                <sp-action-button onClick={() => dialog.close()}>Close</sp-action-button>
            </div>
        </div>
    )
}